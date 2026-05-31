const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();
    const users = await User.find({ isAdmin: false });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.json({
      revenue: totalRevenue,
      orders: orders.length,
      products: products.length,
      users: users.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent self-demotion
    if (user._id.toString() === req.user._id.toString() && user.isAdmin) {
      return res.status(400).json({ message: 'You cannot demote yourself' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({
      message: `User ${user.isAdmin ? 'promoted to' : 'demoted from'} admin`,
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats, getAllOrders, getAllUsers, updateUserRole };