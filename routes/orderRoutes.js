const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middlewares/authMiddleware');
const { updateDeliveryStage } = require('../controllers/orderController');
// POST /api/orders - Create order after payment init
router.post('/', authMiddleware.protect, async (req, res) => {
  try {
    const {
      products,
      shippingAddress,
      phoneNumber,
      totalPrice,
      reference
    } = req.body;

    const user = req.user;
    const orderNumber = reference || `ARC${Date.now()}`;

    const isNigeria = shippingAddress?.country?.toLowerCase().includes('nigeria');
    const shippingFee = isNigeria ? 5 : 20;

    const fullTotal = totalPrice + shippingFee;

    const order = new Order({
      user: user._id,
      orderNumber,
      products,
      shippingAddress,
      phoneNumber,
      totalPrice: fullTotal,
      shippingFee // 💡 Now stored in DB
    });

    await order.save();

    res.status(201).json({ message: 'Order saved. Awaiting payment confirmation.', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Order creation failed' });
  }
});



router.put('/by-number/:orderNumber/stage', updateDeliveryStage);

router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderNumber: orderId }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found. Please check your Order ID.' });
    }

    // 👇 Add this check for pending status
    if (order.status === 'Pending') {
      return res.status(403).json({ message: 'Order not confirmed. Please complete payment before tracking.' });
    }

    // If confirmed, send order data
    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paidAt: order.paidAt || null,
      createdAt: order.createdAt,
      deliveryStage: order.deliveryStage,
      shippingAddress: order.shippingAddress,
      phoneNumber: order.phoneNumber,
      totalPrice: order.totalPrice,
      shippingFee: order.shippingFee,
      products: order.products,
      user: {
        name: order.user.name,
        email: order.user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
