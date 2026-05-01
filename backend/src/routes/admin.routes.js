const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const admin = require('../middleware/admin');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

// Admin login doesn't need the admin middleware
router.post('/login', asyncHandler(adminController.login));

// All routes below require admin authentication
router.use(admin);
router.get('/users', asyncHandler(adminController.getUsers));
router.get('/stats', asyncHandler(adminController.getStats));
router.get('/files', asyncHandler(adminController.getFiles));

module.exports = router;
