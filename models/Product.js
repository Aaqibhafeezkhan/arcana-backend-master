// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String }, // image file path or URL
  inStock: { type: Boolean, default: true },
  brand: { type: String, default: 'Arcana' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
