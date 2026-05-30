const { sendEmail, baseEmailTemplate } = require("../utils/emailService");

const sendContactMessage = async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    subject,
    message,
    enquiry,
  } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const fullName = `${firstName} ${middleName || ""} ${lastName}`.trim();
    const formattedMessage = message.replace(/\n/g, "<br>");

    const messageBoxHTML = `
      <div style="background:#f0e6dc;padding:15px;border-radius:5px;margin:15px 0;color:#4b3f36;font-family:Arial,sans-serif;">
        ${formattedMessage}
      </div>
    `;

    const commonFooter = `
      <hr>
      <p style="margin:0 0 8px;">Arcana — Designed with intention.</p>
      <p style="margin:0;">
        Need help? Reply to this email or contact us at
        <a href="mailto:arcanashopng@gmail.com" style="color:#000;text-decoration:none;">arcanashopng@gmail.com</a>
      </p>
      <p style="margin:0;">© ${new Date().getFullYear()} Arcana. All rights reserved.</p>
    `;

    // Admin Email
    const adminContent = `
      <h3>New Contact Enquiry</h3>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Enquiry Type:</strong> ${enquiry || "Not specified"}</p>
      <p><strong>Message:</strong></p>
      ${messageBoxHTML}
    `;

    sendEmail({
      to: ["nwagudavidisaac@gmail.com", "arcanashopng@gmail.com"],
      subject: `New Contact Form Submission: ${subject || "No Subject"}`,
      html: baseEmailTemplate("New Contact Enquiry", adminContent, commonFooter)
    });

    // User Confirmation
    const userContent = `
      <p>Hi ${firstName},</p>
      <p>Thank you for contacting <strong>Arcana</strong>.</p>
      <p>We've received your message and will get back to you within <strong>2 working days</strong>.</p>
      <p><strong>Your Message:</strong></p>
      ${messageBoxHTML}
      <p>Best regards,<br>The Arcana Team</p>
    `;

    sendEmail({
      to: email,
      subject: "We've received your message! 🤎",
      html: baseEmailTemplate("Message Received", userContent, commonFooter)
    });

    return res.status(200).json({
      message: "Thank you for contacting us! We will get back to you shortly.",
    });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

module.exports = { sendContactMessage };