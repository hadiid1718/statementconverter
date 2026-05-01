const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    convertedName: {
      type: String,
      required: [true, 'Converted filename is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    outputFormat: {
      type: String,
      enum: ['XLSX', 'CSV', 'JSON'],
      default: 'XLSX',
    },
    downloadUrl: {
      type: String,
      required: [true, 'Download URL is required'],
    },
    fileSize: {
      type: Number,
      min: 0,
    },
    processingTime: {
      type: Number, // milliseconds
      min: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes ---
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ status: 1 });
fileSchema.index({ createdAt: -1 });

module.exports = mongoose.model('File', fileSchema);
