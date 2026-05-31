const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { protect, admin } = require('../middlewares/authMiddleware');
const { sendEmail } = require('../utils/emailService'); // FIXED: import sendEmail, not mailer

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
      return res.status(400).json({ message: 'You are already subscribed!' });
    }
    res.status(500).json({ message: 'Subscription failed' });
  }
});

// Get all subscribers (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ subscribers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
});

// Send newsletter (admin only) — YOUR VERSION, MERGED
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

    const html = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #faf8f6; color: #2c241e;">
        <div style="background: #fff; padding: 40px; border: 1px solid #e8e0d8;">
          <h2 style="font-family: 'Playfair Display', serif; color: #3d3025; margin-bottom: 24px; font-size: 24px;">${subject}</h2>
          <div style="line-height: 1.8; color: #3d3025; font-size: 15px;">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e8e0d8; font-size: 12px; color: #8B6A4E;">
            <p>Arcana — Designed With Intention</p>
            <p>© ${new Date().getFullYear()} Arcana. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    const results = [];
    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject: `Arcana Newsletter — ${subject}`,
          html
        });
        results.push({ email: sub.email, status: 'sent' });
      } catch (e) {
        results.push({ email: sub.email, status: 'failed', error: e.message });
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    res.json({ 
      message: `Newsletter sent to ${sent} of ${subscribers.length} subscribers`, 
      results 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;