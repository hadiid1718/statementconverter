const multer = require('multer');
const path = require('path');
const config = require('../config');
const ApiError = require('../utils/ApiError');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type: ${file.mimetype}. Only PDF files are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
});

module.exports = upload;
