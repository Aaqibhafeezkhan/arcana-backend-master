const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Newsletter = require('../models/Newsletter');
const Subscriber = require('../models/Subscriber');
const { sendEmail, baseEmailTemplate } = require('../utils/emailService');

const getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();
    const users = await User.find({ isAdmin: false });
    const subscribers = await Subscriber.countDocuments();
    const newslettersSent = await Newsletter.countDocuments();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.json({
      revenue: totalRevenue,
      orders: orders.length,
      products: products.length,
      users: users.length,
      subscribers,
      newslettersSent
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

// POST /api/admin/email/send — FIXED: wraps in Arcana template
const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'Recipient, subject, and body are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Wrap in Arcana template
    const wrappedHtml = baseEmailTemplate(body, subject);

    await sendEmail({
      to,
      subject,
      html: wrappedHtml
    });

    res.json({ message: `Email sent to ${to}` });
  } catch (err) {
    console.error('Custom email error:', err);
    res.status(500).json({ message: 'Failed to send email', error: err.message });
  }
};

// POST /api/admin/newsletter/send — Send to all subscribers + track
const sendNewsletter = async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No subscribers to send to' });
    }

    const wrappedHtml = baseEmailTemplate(content, subject);
    let sentCount = 0;

    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject: `Arcana Newsletter — ${subject}`,
          html: wrappedHtml
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${sub.email}:`, err.message);
      }
    }

    // Track in database
    await Newsletter.create({
      subject,
      content,
      recipientCount: sentCount,
      sentBy: req.user._id
    });

    res.json({
      message: `Newsletter sent to ${sentCount} of ${subscribers.length} subscribers`,
      sentCount,
      totalSubscribers: subscribers.length
    });
  } catch (err) {
    console.error('Newsletter send error:', err);
    res.status(500).json({ message: 'Failed to send newsletter', error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  getAllUsers,
  updateUserRole,
  sendCustomEmail,
  sendNewsletter
};