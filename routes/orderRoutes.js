const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin, optionalProtect } = require('../middlewares/authMiddleware');
const { updateDeliveryStage } = require('../controllers/orderController');
// POST /api/orders - Create order after payment init
router.post('/', protect, async (req, res) => {
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



router.put('/by-number/:orderNumber/stage', protect, admin, updateDeliveryStage);

router.get('/:orderId', optionalProtect, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderNumber: orderId }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found. Please check your Order ID.' });
    }

    if (order.status === 'Pending') {
      return res.status(403).json({ message: 'Order not confirmed. Please complete payment before tracking.' });
    }

    // Determine whether the caller is the order owner or an admin
    const isOwner = req.user && order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.isAdmin;

    if (isOwner || isAdmin) {
      // Full response for the order owner or an admin
      return res.json({
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
    }

    // Public tracking response — no email, phone, or street-level address
    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      deliveryStage: order.deliveryStage,
      totalPrice: order.totalPrice,
      shippingFee: order.shippingFee,
      products: order.products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
