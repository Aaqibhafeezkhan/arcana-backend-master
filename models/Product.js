const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  stock: { type: Number, default: 0 },
  sizes: [{ type: String }],
  featured: { type: Boolean, default: false },
  brand: { type: String, default: 'Arcana' },
  material: { type: String },
  weight: { type: String },
  fit: { type: String },
  care: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);