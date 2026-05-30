const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus, cancelOrder, cleanPendingOrders } = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/all', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.delete('/clean-pending', protect, admin, cleanPendingOrders);

module.exports = router;