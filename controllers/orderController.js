// controllers/orderController.js
const Order = require('../models/Order');
const sendEmail = require('../utils/sendDeliveryUpdateEmail');

// PATCH /api/orders/:orderNumber/stage
exports.updateDeliveryStage = async (req, res) => {
  const { orderNumber } = req.params;
  const { deliveryStage } = req.body;

  if (!['Reviewing', 'Shipped', 'Delivered', 'Returned', 'Exchanged'].includes(deliveryStage)) {
    return res.status(400).json({ message: 'Invalid delivery stage' });
  }

  try {
    const order = await Order.findOne({ orderNumber }).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the stage
    order.deliveryStage = deliveryStage;

    // Handle exchange logic
    if (deliveryStage === 'Exchanged') {
      const newOrderNumber = `ARC${Date.now()}`;

      const newOrder = new Order({
        user: order.user._id,
        orderNumber: newOrderNumber,
        products: order.products,
        shippingAddress: order.shippingAddress,
        phoneNumber: order.phoneNumber,
        totalPrice: order.totalPrice,
        shippingFee: order.shippingFee,
        status: 'Confirmed', // Since it's an approved exchange
        deliveryStage: 'Reviewing'
      });

      await newOrder.save();

      order.newOrderId = newOrderNumber;
    }

    await order.save();

    // Send emails based on stage
    if (['Shipped', 'Delivered', 'Exchanged', 'Returned'].includes(deliveryStage)) {
      await sendEmail(order);
    }

    res.json({ message: 'Delivery stage updated', order });
  } catch (err) {
    console.error('Delivery stage update error:', err);
    res.status(500).json({ message: 'Failed to update delivery stage' });
  }
};
