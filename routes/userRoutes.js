const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { getUserProfile, getUserOrders, getUserAddresses, uploadProfilePicture, getAllUsers } = require('../controllers/userController');
const upload = require('../middlewares/cloudinaryUpload');

router.get('/profile', protect, getUserProfile);
router.get('/orders', protect, getUserOrders);
router.get('/addresses', protect, getUserAddresses);
router.post('/upload-profile-pic', protect, upload.single('profilePic'), uploadProfilePicture);
router.get('/all', protect, admin, getAllUsers); // Admin only

module.exports = router;