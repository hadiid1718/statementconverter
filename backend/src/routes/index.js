const { Router } = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const fileRoutes = require('./file.routes');

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Mount sub-routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/files', fileRoutes);

// The /convert endpoint kept at top-level /api/convert for backwards compatibility
const fileController = require('../controllers/file.controller');
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');

router.post('/convert', upload.single('file'), asyncHandler(fileController.convert));

module.exports = router;
