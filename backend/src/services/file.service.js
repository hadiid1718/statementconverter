const File = require('../models/File');

class FileService {
  /**
   * Save a completed file conversion record.
   */
  static async saveFileRecord({
    userId,
    originalName,
    convertedName,
    outputFormat = 'XLSX',
    fileSize,
    processingTime,
  }) {
    return File.create({
      userId,
      originalName,
      convertedName,
      status: 'completed',
      outputFormat,
      downloadUrl: `/api/files/download/${convertedName}`,
      fileSize,
      processingTime,
    });
  }

  /**
   * Save a failed file conversion record.
   */
  static async saveFailedRecord({
    userId,
    originalName,
    fileSize,
    processingTime,
    errorMessage,
  }) {
    return File.create({
      userId,
      originalName,
      convertedName: '',
      status: 'failed',
      outputFormat: 'XLSX',
      downloadUrl: '',
      fileSize,
      processingTime,
      errorMessage,
    });
  }

  /**
   * Get files for a specific user.
   */
  static async getUserFiles(userId) {
    return File.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'email fullName');
  }

  /**
   * Get all files with pagination (admin).
   */
  static async getAllFiles({ page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [files, totalFiles] = await Promise.all([
      File.find()
        .populate('userId', 'email fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      File.countDocuments(),
    ]);

    return {
      files,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFiles / limit),
        totalFiles,
        hasNext: page * limit < totalFiles,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get file counts by status.
   */
  static async getFileCounts() {
    const [total, completed, failed] = await Promise.all([
      File.countDocuments(),
      File.countDocuments({ status: 'completed' }),
      File.countDocuments({ status: 'failed' }),
    ]);
    return { total, completed, failed };
  }

  /**
   * Count files created since a given date.
   */
  static async countRecentFiles(sinceDate) {
    return File.countDocuments({ createdAt: { $gte: sinceDate } });
  }
}

module.exports = FileService;
