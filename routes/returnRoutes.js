const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const sendReturnRequestEmail = require('../utils/sendReturnRequestEmail');

// POST /api/returns/return-request
// No session token is required; the caller must provide the email address on the order
// to prove they are the customer. This prevents arbitrary order IDs being submitted
// by strangers who do not know the associated email.
router.post('/return-request', async (req, res) => {
  try {
    const { orderId, reason, type, email } = req.body; // type: 'Return' or 'Exchange'

    if (!orderId || !reason || !['Return', 'Exchange'].includes(type)) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const order = await Order.findOne({ orderNumber: orderId }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Invalid Order ID' });
    }

    // Verify the caller knows the email on the order
    if (order.user.email.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(403).json({ message: 'The email address does not match our records for this order.' });
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
