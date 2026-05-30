// routes/newsletterRoutes.js
const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    await Subscriber.create({ email });
    res.json({ message: "Subscription successful!" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
