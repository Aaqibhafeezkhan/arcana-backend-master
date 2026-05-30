const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const sendReturnRequestEmail = require('../utils/sendReturnRequestEmail');

// POST /api/orders/return-request
router.post('/return-request', async (req, res) => {
  try {
    const { orderId, reason, type } = req.body; // type: 'Return' or 'Exchange'

    if (!orderId || !reason || !['Return', 'Exchange'].includes(type)) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const order = await Order.findOne({ orderNumber: orderId }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Invalid Order ID' });
    }

    if (order.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Only confirmed orders can be returned or exchanged.' });
    }

    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const diffDays = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      return res.status(403).json({
        message: 'We are sorry, but this order cannot be returned or exchanged, because it has exceeded the Return or Exchange timeline (30 days).'
      });
    }

    // Send confirmation emails to user and admins
    await sendReturnRequestEmail(order, reason, type);

    res.json({ message: `${type} request submitted successfully. Check your email for confirmation.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error submitting return/exchange request' });
  }
});

module.exports = router;
