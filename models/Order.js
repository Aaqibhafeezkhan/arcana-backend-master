const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Pending', 'Confirmed'], default: 'Pending' },
  deliveryStage: { type: String, enum: ['Reviewing', 'Shipped', 'Delivered', 'Returned', 'Exchanged'], default: 'Reviewing' },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      price: { type: Number },
      size: { type: String }
    }
  ],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  phoneNumber: { type: String },
  totalPrice: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  trackingNumber: { type: String },
  newOrderId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);