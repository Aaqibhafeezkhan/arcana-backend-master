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

    const content = `
      <p>Hi ${newUser.name},</p>
      <p>Welcome to Arcana. We're thrilled to have you on board.</p>
      <p>Explore our products and enjoy exclusive experiences.</p>
      <p>
        <a href="https://shop-arcana.store"
           style="display:inline-block;padding:8px 30px;background:#59493b;color:#fff;border-radius:5px; text-decoration:none;">
          Explore Now
        </a>
      </p>
      <p>Best Regards,<br>The Arcana Team</p>
    `;

    sendEmail({
      to: newUser.email,
      subject: "Welcome to Arcana — Designed With Intention",
      html: baseEmailTemplate("Welcome to Arcana", content)
    });

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

    const content = `
      <p>Hi ${user.name},</p>
      <p>We noticed a new login to your Arcana account.</p>
      <p>If this was you, no action is needed.</p>
      <p>If not, please reset your password immediately.</p>
      <p>
        <a href="https://shop-arcana.store/forgot_password.html"
           style="display:inline-block;padding:8px 30px;background:#59493b;color:#fff;border-radius:5px;margin:30px 0; text-decoration:none;">
          Reset Password
        </a>
      </p>
      <br>
      <p>Best Regards,<br>The Arcana Team</p>
    `;

    sendEmail({
      to: user.email,
      subject: "New Login to Your Arcana Account",
      html: baseEmailTemplate("New Login to Your Arcana Account", content)
    });

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

    const content = `
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password.</p>
      <p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:8px 30px;background:#59493b;color:#fff;border-radius:5px;margin:30px 0; text-decoration:none;">
          Reset Password
        </a>
      </p>
      <p>This link expires in 1 hour.</p>
      <p>Best Regards,<br>The Arcana Team</p>
    `;

    sendEmail({
      to: [user.email, "arcanashopng@gmail.com", "nwagudavidisaac@gmail.com"],
      subject: "Reset Your Password",
      html: baseEmailTemplate("Reset Your Password", content)
    });

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