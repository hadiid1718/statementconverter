const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', auth, asyncHandler(authController.me));
router.post('/logout', authController.logout);

module.exports = router;
