const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/authController');

const {
  registerUser,
  loginUser,
  getProfile,
  uploadProfilePic,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware'); // ✅ Correct import
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', protect, getProfile);
router.post('/upload-profile-pic', protect, uploadProfilePic);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword); // for password change

module.exports = router;