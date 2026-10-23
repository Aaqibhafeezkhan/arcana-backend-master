const crypto = require('crypto');
const https = require('https');
const Order = require('../models/Order');
const sendOrderEmails = require('../utils/sendOrderEmail');
const Cart = require('../models/Cart');
const { sendEmail, baseEmailTemplate } = require('../utils/emailService');
const { orderAmountKobo } = require('../utils/paymentAmount');

const ADMIN_EMAILS = ['arcanashopng@gmail.com', 'nwagudavidisaac@gmail.com'];

// Send an alert to admins when a webhook event cannot be processed normally.
async function alertAdmins({ reference, paidAmountKobo, paidCurrency, customerEmail, reason }) {
  const subject = `⚠️ Paystack webhook alert — ${reason}`;
  const content = `
    <div class="animate-fade-up delay-1">
      <div class="heading">Webhook <span class="heading-accent">Alert</span></div>
      <div class="subheading">${reason}</div>
    </div>
    <div class="info-box animate-fade-up delay-2">
      <p>
        <strong>Reference:</strong> ${reference}<br>
        <strong>Paid amount:</strong> ${paidAmountKobo} ${paidCurrency}<br>
        <strong>Customer email (Paystack):</strong> ${customerEmail || 'N/A'}<br>
        <strong>Reason:</strong> ${reason}
      </p>
    </div>
    <div class="content animate-fade-up delay-3">
      <p class="small">This order has been left unconfirmed. No action was taken automatically.</p>
    </div>
  `;
  try {
    await sendEmail({
      to: ADMIN_EMAILS,
      subject,
      html: baseEmailTemplate(content, subject),
    });
  } catch (err) {
    console.error('❌ Failed to send webhook admin alert:', err.message);
  }
}

const initializePayment = async (req, res) => {
  const { email, reference } = req.body;

  // Compute the charge amount server-side from the stored order rather than
  // trusting the client-supplied value, which could be tampered with.
  let amountInKobo;
  let order;
  try {
    order = await Order.findOne({ orderNumber: reference });
    if (!order) {
      // (improvement d) — do not call Paystack if there is no order to pay for
      return res.status(404).json({ message: 'Order not found for this reference. Please create an order first.' });
    }
    amountInKobo = orderAmountKobo(order);
  } catch (err) {
    console.error('⚠️ Could not look up order for amount computation:', err.message);
    return res.status(500).json({ message: 'Could not initialize payment' });
  }

  const params = JSON.stringify({
    email,
    amount: amountInKobo,
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
      'Content-Type': 'application/json',
    },
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
  console.log('📬 Paystack webhook received:', event.event);

  if (event.event === 'charge.success') {
    const paymentData = event.data;
    const reference = paymentData.reference;
    const customerEmail = paymentData.customer?.email;
    const paidAmountKobo = paymentData.amount;
    const paidCurrency = paymentData.currency;

    try {
      const order = await Order.findOne({ orderNumber: reference }).populate('user', '-password');

      if (!order) {
        // The order may have been deleted by the expiry cron (30-minute window).
        // Return 200 so Paystack does not keep retrying this webhook.
        const reason = 'Order not found — possibly expired before payment completed';
        console.warn(`⚠️ Webhook: ${reason} (ref: ${reference})`);
        await alertAdmins({ reference, paidAmountKobo, paidCurrency, customerEmail, reason });
        return res.status(200).json({ message: 'Webhook received' });
      }

      if (order.status === 'Confirmed') {
        // Idempotency guard — do not re-process or re-send emails.
        console.log(`✅ Order already confirmed: ${reference}`);
        return res.status(200).json({ message: 'Already processed' });
      }

      // Verify the amount and currency Paystack actually collected
      const expectedKobo = orderAmountKobo(order);

      if (paidCurrency !== 'NGN' || Math.abs(paidAmountKobo - expectedKobo) > 1) {
        const reason = `Amount or currency mismatch: paid ${paidAmountKobo} ${paidCurrency}, expected ${expectedKobo} NGN`;
        console.warn(`⚠️ Webhook: ${reason} (ref: ${reference})`);
        await alertAdmins({ reference, paidAmountKobo, paidCurrency, customerEmail, reason });
        return res.status(200).json({ message: 'Webhook received' });
      }

      order.status = 'Confirmed';
      await order.save();
      console.log(`📦 Order ${reference} confirmed`);

      // Send order-confirmation emails (fire-and-forget, never block the 200 response)
      try {
        await sendOrderEmails({ user: order.user, order, exchangeRate: 1547.30 });
        console.log(`📧 Confirmation emails sent for order ${reference}`);
      } catch (emailErr) {
        console.error('❌ Failed to send confirmation emails:', emailErr);
      }

      // Clear the user's cart
      try {
        const cart = await Cart.findOne({ user: order.user._id });
        if (cart) {
          await cart.deleteOne();
          console.log(`🛒 Cart cleared for user ${order.user._id}`);
        }
      } catch (cartErr) {
        console.error('❌ Failed to clear cart:', cartErr);
      }

    } catch (err) {
      console.error('❌ Webhook processing error:', err);
    }
  }

  res.status(200).json({ message: 'Webhook received' });
};

module.exports = { initializePayment, handleWebhook };
