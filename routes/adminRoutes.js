const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Subscriber = require('../models/Subscriber');

router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const [users, products, orders, revenue] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $nin: ['Pending', 'Cancelled'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);
    res.status(200).json({
      users,
      products,
      orders,
      revenue: revenue[0]?.total || 0,
      subscribers: await Subscriber.countDocuments(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;