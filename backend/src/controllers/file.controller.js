const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../config');
const PdfService = require('../services/pdf.service');
const FileService = require('../services/file.service');
const UserService = require('../services/user.service');
const ApiError = require('../utils/ApiError');

/**
 * File controllers.
 */
const fileController = {
  /**
   * GET /api/files — list current user's converted files.
   */
  getUserFiles: async (req, res) => {
    const files = await FileService.getUserFiles(req.user.id);
    res.json({ files });
  },

  /**
   * POST /api/convert — upload PDF, convert to Excel, return download.
   */
  convert: async (req, res, next) => {
    const startTime = Date.now();

    if (!req.file) {
      throw ApiError.badRequest('No file uploaded');
    }

    // Extract user from token (optional — anonymous conversion allowed)
    let userId = null;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        userId = decoded.id;

        // Track conversion count for non-admin users
        if (decoded.role !== 'admin') {
          await UserService.incrementFileCount(decoded.id);
        }
      } catch {
        // Invalid token — continue without tracking
      }
    }

    try {
      // Core conversion
      const { fileName, filePath: excelPath } =
        await PdfService.convertPdfToExcel(req.file.path);

      const processingTime = Date.now() - startTime;

      // Save record to DB if authenticated
      if (userId) {
        await FileService.saveFileRecord({
          userId,
          originalName: req.file.originalname,
          convertedName: fileName,
          fileSize: req.file.size,
          processingTime,
        }).catch((err) =>
          console.error('Failed to save file record:', err.message)
        );
      }

      // Send file to client, then cleanup the uploaded PDF
      res.download(excelPath, (err) => {
        PdfService.cleanupFile(req.file.path);
        if (err) next(err);
      });
    } catch (error) {
      // Save failure record
      if (userId) {
        await FileService.saveFailedRecord({
          userId,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          processingTime: Date.now() - startTime,
          errorMessage: error.message,
        }).catch((err) =>
          console.error('Failed to save failure record:', err.message)
        );
      }

      PdfService.cleanupFile(req.file.path);
      throw error;
    }
  },

  /**
   * GET /api/files/download/:filename — serve a converted file.
   */
  download: (req, res) => {
    const { filename } = req.params;
    // Prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(config.UPLOAD_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      throw ApiError.notFound('File not found');
    }

    res.download(filePath);
  },
};

module.exports = fileController;
