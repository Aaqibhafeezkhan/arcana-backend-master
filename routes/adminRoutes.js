const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getDashboardStats,
  getAllOrders,
  getAllUsers,
  updateUserRole,
  sendCustomEmail,
  sendNewsletter
} = require('../controllers/adminController');

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/orders', protect, admin, getAllOrders);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.post('/email/send', protect, admin, sendCustomEmail);
router.post('/newsletter/send', protect, admin, sendNewsletter);

module.exports = router;