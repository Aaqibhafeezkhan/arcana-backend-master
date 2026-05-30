const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');
const { baseEmailTemplate } = require('../utils/mailer');
const crypto = require('crypto');

const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Send welcome email
    const welcomeContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Welcome, <span class="heading-accent">${user.name}</span></div>
        <div class="subheading">You've entered a space where every thread is intentional, every silhouette considered, every detail deliberate.</div>
      </div>
      <div class="content animate-fade-up delay-2">
        <p>Your Arcana account is now active. This is more than a wardrobe — it's a philosophy.</p>
        <ul>
          <li>Track orders with precision and care</li>
          <li>Save addresses for seamless checkout</li>
          <li>Receive first access to limited drops</li>
          <li>Curate your personal collection</li>
        </ul>
        <div class="divider"></div>
        <div class="quote">"The best things in life are the people we love, the places we've been, and the memories we've made along the way."</div>
      </div>
    `;
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Arcana — Designed With Intention',
      html: baseEmailTemplate(welcomeContent, 'Welcome to Arcana'),
    }).catch(() => {});

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link was sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset_password.html?token=${resetToken}`;

    const resetContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Reset Your <span class="heading-accent">Password</span></div>
        <div class="subheading">A secure link, crafted just for you. Valid for one hour.</div>
      </div>
      <div class="content animate-fade-up delay-2">
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your Arcana account password. Click below to create a new one.</p>
        <div class="btn-wrap">
          <a href="${resetUrl}" class="btn">Create New Password</a>
        </div>
        <div class="info-box animate-fade-up delay-3">
          <p><strong>Security Note:</strong><br>This link expires in 1 hour. If you didn't request this, no action is needed — your account remains secure.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Arcana Password Reset Request',
      html: baseEmailTemplate(resetContent, 'Reset Your Password'),
    }).catch(() => {});

    res.status(200).json({ message: 'If that email exists, a reset link was sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send password changed confirmation
    const changedContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Password <span class="heading-accent">Updated</span></div>
        <div class="subheading">Your account security has been refreshed.</div>
      </div>
      <div class="content animate-fade-up delay-2">
        <p>Hi ${user.name},</p>
        <p>Your Arcana account password was successfully changed. If you initiated this update, no further action is required.</p>
        <div class="info-box animate-fade-up delay-3">
          <p><strong>Didn't authorize this?</strong><br>Contact our support team immediately at <a href="mailto:support@mail.shop-arcana.store" style="color: #59493b; text-decoration: none; border-bottom: 1px solid rgba(89,73,59,0.3);">support@mail.shop-arcana.store</a></p>
        </div>
      </div>
    `;
    await sendEmail({
      to: user.email,
      subject: 'Your Arcana Password Was Changed',
      html: baseEmailTemplate(changedContent, 'Password Updated'),
    }).catch(() => {});

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, resendVerification };