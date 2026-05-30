const Paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);
const Order = require('../models/Order');

const initializePayment = async (req, res) => {
  const { email, amount, reference } = req.body;

  try {
    const response = await Paystack.transaction.initialize({
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      callback_url: process.env.PAYSTACK_CALLBACK_URL,
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Payment initialization failed', error: error.message });
  }
};

const handleWebhook = async (req, res) => {
  const event = req.body;

  if (event.event === 'charge.success') {
    const { reference } = event.data;
    try {
      const order = await Order.findOneAndUpdate(
        { orderNumber: reference },
        { status: 'Paid' },
        { new: true }
      );
      if (order) {
        console.log(`Order ${reference} marked as paid`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }

  res.status(200).json({ received: true });
};

module.exports = { initializePayment, handleWebhook };