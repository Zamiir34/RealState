const express = require('express');
const {
  register, login, logout, getMe, updateProfile, updateAvatar,
  changePassword, forgotPassword, resetPassword, verifyEmail, resendVerification,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.put('/change-password', protect, changePassword);
router.post('/resend-verification', protect, resendVerification);

module.exports = router;
