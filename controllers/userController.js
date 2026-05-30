
const User = require('../models/User');
const Order = require('../models/Order');
const Address = require('../models/Address');
const path = require('path');
const fs = require('fs');

const getUserProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfilePicture = async (req, res) => {
  if (!req.files || !req.files.profilePicture) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const file = req.files.profilePicture;
  const filename = `${req.user._id}${path.extname(file.name)}`;
  const filepath = path.join(__dirname, '../uploads', filename);

  file.mv(filepath, async (err) => {
    if (err) return res.status(500).json({ message: 'Upload failed' });
    req.user.profilePicture = `/uploads/${filename}`;
    await req.user.save();
    res.json({ message: 'Profile picture updated', url: req.user.profilePicture });
  });
};

const getOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

const getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id);
res.json(user.addresses || []);

};

module.exports = { getUserProfile, updateProfilePicture, getOrders, getAddresses };