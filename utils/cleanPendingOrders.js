const cron = require('node-cron');
const Order = require('../models/Order');
const { sendEmail } = require('./emailService');

// Run every minute
const startCleanPendingOrders = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const pendingOrders = await Order.find({
        status: 'Pending',
        createdAt: { $lt: tenMinutesAgo }
      }).populate('user');

      for (const order of pendingOrders) {
        await Order.findByIdAndDelete(order._id);

        // Notify user
        if (order.user && order.user.email) {
          await sendEmail({
            to: order.user.email,
            subject: 'Order Cancelled — Payment Timeout',
            html: `<p>Your order #${order.orderNumber} was cancelled due to payment timeout.</p>`,
          }).catch(() => {});
        }

        // Notify admin
        await sendEmail({
          to: 'arcanashopng@gmail.com',
          subject: 'Pending Order Auto-Cancelled',
          html: `<p>Order #${order.orderNumber} was auto-cancelled after 10 minutes.</p>`,
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Clean pending orders error:', error);
    }
  });
};

module.exports = startCleanPendingOrders;