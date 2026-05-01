const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const config = require('../config');

class PdfService {
  /**
   * Parse a PDF file and extract transaction rows.
   * @param {string} filePath - Absolute path to the uploaded PDF.
   * @returns {Array<{ date: string, description: string, amount: string }>}
   */
  static async parsePdf(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const lines = data.text.split('\n').filter((line) => line.trim());

    return lines.map((line) => ({
      date: line.substring(0, 10),
      description: line.substring(10, 50).trim(),
      amount: line.substring(50).trim(),
    }));
  }

  /**
   * Convert an array of transaction objects to an Excel (.xlsx) file.
   * @param {Array} transactions
   * @returns {{ fileName: string, filePath: string }}
   */
  static generateExcel(transactions) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const fileName = `converted-${Date.now()}.xlsx`;
    const filePath = path.join(config.UPLOAD_DIR, fileName);
    XLSX.writeFile(workbook, filePath);

    return { fileName, filePath };
  }

  /**
   * End-to-end: parse PDF → generate Excel.
   * @param {string} pdfPath - Path to the uploaded PDF.
   * @returns {{ fileName: string, filePath: string, transactions: Array }}
   */
  static async convertPdfToExcel(pdfPath) {
    const transactions = await PdfService.parsePdf(pdfPath);
    const { fileName, filePath } = PdfService.generateExcel(transactions);
    return { fileName, filePath, transactions };
  }

  /**
   * Safely remove a file from disk.
   */
  static cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Failed to cleanup file ${filePath}:`, err.message);
    }
  }
}

module.exports = PdfService;
