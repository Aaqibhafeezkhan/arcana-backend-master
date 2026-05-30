
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String,
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);