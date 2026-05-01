const { Router } = require('express');
const fileController = require('../controllers/file.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

// Get user's files (authenticated)
router.get('/', auth, asyncHandler(fileController.getUserFiles));

// Convert PDF → Excel (token is optional — handled inside controller)
router.post('/convert', upload.single('file'), asyncHandler(fileController.convert));

// Download a converted file
router.get('/download/:filename', asyncHandler(fileController.download));

module.exports = router;
