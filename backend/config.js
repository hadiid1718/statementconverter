module.exports = {
  PORT: process.env.PORT || 5000,
  ALLOWED_FILE_TYPES: ['application/pdf'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  UPLOAD_DIR: 'uploads'
};