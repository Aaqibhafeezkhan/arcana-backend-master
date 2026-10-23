const axios = require('axios');
const crypto = require('crypto');
const https = require('https');
const Order = require('../models/Order');
const User = require('../models/User');
const sendOrderEmails = require('../utils/sendOrderEmail');
const Cart = require('../models/Cart'); // Add this at the top

// NGN/USD exchange rate used throughout the checkout flow
const EXCHANGE_RATE = 1547.30;

const initializePayment = async (req, res) => {
  const { email, reference } = req.body;

  // Compute the charge amount server-side from the stored order rather than
  // trusting the client-supplied value, which could be tampered with.
  let amountInKobo;
  try {
    const order = await Order.findOne({ orderNumber: reference });
    if (!order) {
      return res.status(404).json({ message: 'Order not found for reference' });
    }
    amountInKobo = Math.round(order.totalPrice * EXCHANGE_RATE * 100);
  } catch (err) {
    console.error('⚠️ Could not look up order for amount computation:', err.message);
    return res.status(500).json({ message: 'Could not initialize payment' });
  }

  const params = JSON.stringify({
    email,
    amount: amountInKobo,
    reference,
    callback_url: 'https://shop-arcana.store/index.html',
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
        // The order may have been deleted by the expiry cron (30-minute window).
        // Return 200 so Paystack does not keep retrying this webhook.
        console.warn(`⚠️ Webhook: order not found for reference ${reference} — possibly expired before payment completed`);
        return res.status(200).json({ message: 'Webhook received' });
      }

      if (order.status === 'Confirmed') {
        // Idempotency guard — do not re-process or re-send emails.
        console.log(`✅ Order already confirmed: ${reference}`);
        return res.status(200).json({ message: 'Already processed' });
      }

      // Verify the amount and currency Paystack actually collected
      const paidAmountKobo = paymentData.amount;
      const paidCurrency = paymentData.currency;
      const expectedAmountKobo = Math.round(order.totalPrice * EXCHANGE_RATE * 100);

      if (paidCurrency !== 'NGN' || Math.abs(paidAmountKobo - expectedAmountKobo) > 1) {
        console.warn(
          `⚠️ Amount mismatch for ${reference}: ` +
          `paid ${paidAmountKobo} ${paidCurrency}, expected ${expectedAmountKobo} NGN — order left unconfirmed`
        );
        return res.status(200).json({ message: 'Webhook received' });
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
