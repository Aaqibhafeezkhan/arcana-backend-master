const mongoose = require('mongoose');
const sendOrderEmails = require('../utils/sendOrderEmail');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  status: { type: String, default: 'Pending' }, // For payment status
  newOrderId: {
  type: String,
  default: null
  },
  deliveryStage: {
    type: String,
    enum: ['Reviewing', 'Shipped', 'Delivered', 'Returned', 'Exchanged'],
    default: 'Reviewing'
  },
  createdAt: { type: Date, default: Date.now },
  products: [
    {
      productId: String,
      title: String,
      size: String,
      image: String,
      quantity: Number,
      price: Number,
    }
  ],
  shippingAddress: {
    country: String,
    state: String,
    city: String,
    street: String,
    postalCode: String,
  },
  phoneNumber: String,
  totalPrice: Number,
  shippingFee: Number,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
