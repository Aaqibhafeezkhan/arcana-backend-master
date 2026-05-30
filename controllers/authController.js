const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const { sendEmail, baseEmailTemplate } = require("../utils/emailService");

// Cloudinary
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * REGISTER USER
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const newUser = await User.create({ name, email, password });
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });

    const welcomeContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Welcome, <span class="heading-accent">${newUser.name}</span></div>
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
        <div class="btn-wrap">
          <a href="https://shop-arcana.store" class="btn">Explore Arcana</a>
        </div>
      </div>
    `;

    await sendEmail({
      to: newUser.email,
      subject: "Welcome to Arcana — Designed With Intention",
      html: baseEmailTemplate(welcomeContent, "Welcome to Arcana"),
    }).catch(() => {});

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * LOGIN USER
 */
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({ email: identifier });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });

    const loginContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">New <span class="heading-accent">Login</span></div>
        <div class="subheading">We noticed a new sign-in to your Arcana account.</div>
      </div>
      <div class="content animate-fade-up delay-2">
        <p>Hi ${user.name},</p>
        <p>If this was you, no action is needed. Your account is secure and you can continue shopping.</p>
        <div class="info-box animate-fade-up delay-3">
          <p><strong>Not you?</strong><br>If you didn't sign in recently, we recommend resetting your password immediately to protect your account.</p>
        </div>
        <div class="btn-wrap">
          <a href="https://shop-arcana.store/forgot_password.html" class="btn">Reset Password</a>
        </div>
        <p class="small">This alert was sent to ${user.email} on ${new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "New Login to Your Arcana Account",
      html: baseEmailTemplate(loginContent, "New Login Detected"),
    }).catch(() => {});

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * FORGOT PASSWORD
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `https://shop-arcana.store/reset_password.html?token=${token}`;

    res.json({ message: "Reset link sent. Please check your email." });

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
      to: [user.email, "arcanashopng@gmail.com", "nwagudavidisaac@gmail.com"],
      subject: "Arcana Password Reset Request",
      html: baseEmailTemplate(resetContent, "Reset Your Password"),
    }).catch(() => {});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// Keep these functions exactly as they were in your original file
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

const uploadProfilePic = async (req, res) => {
  if (!req.files || !req.files.profilePic) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const bufferStream = streamifier.createReadStream(req.files.profilePic.data);

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "arcana/profile_pictures" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      bufferStream.pipe(stream);
    });

    const user = await User.findById(req.user.id);
    user.profilePicture = result.secure_url;
    await user.save();

    res.json({ message: "Profile picture uploaded", url: user.profilePicture });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { name, phone, address } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address && address.street) user.addresses = [address];

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful." });

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
          <p><strong>Didn't authorize this?</strong><br>Contact our support team immediately at <a href="mailto:arcanashopng@gmail.com" style="color: #59493b; text-decoration: none; border-bottom: 1px solid rgba(89,73,59,0.3);">arcanashopng@gmail.com</a></p>
        </div>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Your Arcana Password Was Changed",
      html: baseEmailTemplate(changedContent, "Password Updated"),
    }).catch(() => {});

  } catch (err) {
    res.status(500).json({ message: "Could not reset password." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  uploadProfilePic,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};