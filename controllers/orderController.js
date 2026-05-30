const Order = require('../models/Order');
const User = require('../models/User');
const sendOrderEmails = require('../utils/sendOrderEmail');
const sendDeliveryUpdateEmail = require('../utils/sendDeliveryUpdateEmail');

const createOrder = async (req, res) => {
  const { products, shippingAddress, phoneNumber, totalPrice, shippingFee } = req.body;

  try {
    const orderNumber = `ARC${Date.now()}`;
    const order = new Order({
      user: req.user._id,
      products,
      shippingAddress,
      phoneNumber,
      totalPrice,
      shippingFee,
      orderNumber,
      status: 'Pending',
      deliveryStage: 'Reviewing',
    });

    await order.save();

    const user = await User.findById(req.user._id);
    if (user) {
      await sendOrderEmails(order, user).catch(err => console.error('Order email failed:', err));
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status, deliveryStage, trackingNumber, newOrderId } = req.body;

  try {
    const order = await Order.findById(req.params.id).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status) order.status = status;
    if (deliveryStage) {
      order.deliveryStage = deliveryStage;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (newOrderId) order.newOrderId = newOrderId;

      // Send delivery update email
      if (order.user) {
        await sendDeliveryUpdateEmail(order, order.user, deliveryStage, newOrderId)
          .catch(err => console.error('Delivery email failed:', err));
      }
    }

    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'Pending' },
      { status: 'Cancelled' },
      { new: true }
    );
    if (!order) return res.status(400).json({ message: 'Cannot cancel this order' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cleanPendingOrders = async (req, res) => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const result = await Order.deleteMany({
      status: 'Pending',
      createdAt: { $lt: tenMinutesAgo }
    });
    res.status(200).json({ message: `Deleted ${result.deletedCount} pending orders` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  cleanPendingOrders,
};