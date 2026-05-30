
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getUserProfile,
  getOrders,
  getAddresses,
} = require('../controllers/userController');

router.get('/profile', protect, getUserProfile);
router.get('/orders', protect, getOrders);
router.get('/addresses', protect, getAddresses);

module.exports = router;