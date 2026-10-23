const axios = require('axios');
const crypto = require('crypto');
const https = require('https');
const Order = require('../models/Order');
const User = require('../models/User');
const sendOrderEmails = require('../utils/sendOrderEmail');
const Cart = require('../models/Cart'); // Add this at the top

const initializePayment = async (req, res) => {
  const { email, amount, reference } = req.body;

  const params = JSON.stringify({
    email,
    amount,
    reference,
    callback_url: 'https://arcana-frontend-two.vercel.app/index.html',
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const reqPaystack = https.request(options, paystackRes => {
    let data = '';
    paystackRes.on('data', chunk => (data += chunk));
    paystackRes.on('end', () => {
      res.send(JSON.parse(data));
    });
  });

  reqPaystack.on('error', error => res.status(500).send(error));
  reqPaystack.write(params);
  reqPaystack.end();
};

const handleWebhook = async (req, res) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const event = req.body;
console.log("📬 Paystack webhook received:", event.event);
  if (event.event === 'charge.success') {
    const paymentData = event.data;
    const reference = paymentData.reference;

    try {
      const order = await Order.findOne({ orderNumber: reference }).populate('user');

      if (!order) {
        console.warn(`⚠️ Order not found for reference: ${reference}`);
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.status === 'Confirmed') {
        console.log(`✅ Order already confirmed: ${reference}`);
        return res.status(200).json({ message: 'Already processed' });
      }

      order.status = 'Confirmed';
      await order.save();

      console.log(`📦 Order ${reference} confirmed`);

      // Send emails
      try {
        console.log("➡️ Preparing to send confirmation emails...");
        await sendOrderEmails({ user: order.user, order, exchangeRate: 1547.30 });
        console.log("✅ Emails sent successfully.");
        console.log(`📧 Email sent for order ${reference}`);
      } catch (emailErr) {
        console.error(`❌ Failed to send emails:`, emailErr);
      }

      // Clear cart
      try {
  const cart = await Cart.findOne({ user: order.user._id });
  if (!cart) {
    console.warn(`⚠️ No cart found for user ${order.user._id}`);
  } else {
    await cart.deleteOne();
    console.log(`🛒 Cart cleared for user ${order.user._id}`);
  }
} catch (err) {
  console.error("❌ Failed to delete cart:", err);
}
    } catch (err) {
      console.error('❌ Webhook processing error:', err);
    }
  }

  res.status(200).json({ message: 'Webhook received' });
};

module.exports = {
  initializePayment,
  handleWebhook,
};
