const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const Newsletter = require('../models/Newsletter');
const { protect, admin } = require('../middlewares/authMiddleware');
const { sendEmail, baseEmailTemplate } = require('../utils/emailService');

// Subscribe (public)
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const subscriber = new Subscriber({ email });
    await subscriber.save();
    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You are already subscribed!' });
    }
    res.status(500).json({ message: 'Subscription failed' });
  }
});

// Get all subscribers (admin only) — FIXED: sort by subscribedAt
router.get('/', protect, admin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json({ subscribers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
});

// Send newsletter (admin only) — FIXED: uses baseEmailTemplate, tracks in Newsletter model
router.post('/send', protect, admin, async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    const subscribers = await Subscriber.find();
    if (!subscribers.length) {
      return res.status(400).json({ message: 'No subscribers to send to' });
    }

    // Wrap content in Arcana template
    const html = baseEmailTemplate(content, subject);

    let sentCount = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject: `Arcana Newsletter — ${subject}`,
          html
        });
        sentCount++;
      } catch (e) {
        console.error(`Failed to send to ${sub.email}:`, e.message);
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
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;