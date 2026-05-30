const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Order = require('../models/Order');
const sendReturnRequestEmail = require('../utils/sendReturnRequestEmail');

router.post('/', protect, async (req, res) => {
  try {
    const { orderId, reason, type } = req.body;
    const order = await Order.findById(orderId).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await sendReturnRequestEmail(order, order.user, reason, type || 'return');
    res.status(200).json({ message: 'Return request submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;