const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  convertedName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  outputFormat: {
    type: String,
    enum: ['XLSX', 'CSV', 'JSON'],
    default: 'XLSX'
  },
  downloadUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number // in bytes
  },
  processingTime: {
    type: Number // in milliseconds
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

// Indexes for better query performance
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ status: 1 });

module.exports = mongoose.model('File', fileSchema);
