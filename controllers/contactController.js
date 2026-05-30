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

    // Admin Email
    const adminContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">New Contact <span class="heading-accent">Enquiry</span></div>
        <div class="subheading">A message has arrived through the Arcana contact form.</div>
      </div>
      <div class="info-box animate-fade-up delay-2">
        <p><strong style="font-family: 'Playfair Display', serif;">From:</strong><br>
        <span style="color: #3d3025;">
          ${fullName}<br>
          ${email}<br>
          ${enquiry ? `Enquiry Type: ${enquiry}` : ""}
        </span></p>
      </div>
      <div class="content animate-fade-up delay-3">
        <p><strong style="font-family: 'Playfair Display', serif;">Message:</strong></p>
        <div style="background: #ffffff; padding: 24px; margin: 16px 0; border-left: 4px solid #59493b; box-shadow: 0 4px 20px rgba(89,73,59,0.06);">
          <p style="margin: 0; font-size: 14px; line-height: 1.75; color: #3d3025;">${formattedMessage}</p>
        </div>
      </div>
      <div class="content animate-fade-up">
        <p class="small">Subject: ${subject || "No Subject"}</p>
      </div>
    `;

    await sendEmail({
      to: ["nwagudavidisaac@gmail.com", "arcanashopng@gmail.com"],
      subject: `New Contact Form Submission: ${subject || "No Subject"}`,
      html: baseEmailTemplate(adminContent, "New Contact Enquiry"),
    });

    // User Confirmation
    const userContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Message <span class="heading-accent">Received</span></div>
        <div class="subheading">Thank you for reaching out, ${firstName}.</div>
      </div>
      <div class="content animate-fade-up delay-2">
        <p>We've received your message and hold it with the same attention we give every detail of our craft. A response will reach you within <strong>2 working days</strong>.</p>
        <div class="divider"></div>
        <div class="info-box animate-fade-up delay-3">
          <p><strong>Your Message:</strong></p>
          <p style="margin-top: 12px; font-size: 14px; line-height: 1.75; color: #3d3025;">${formattedMessage}</p>
        </div>
        <p class="small">For urgent matters, contact us directly at <a href="mailto:arcanashopng@gmail.com">arcanashopng@gmail.com</a></p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Arcana — We've Received Your Message",
      html: baseEmailTemplate(userContent, "Message Received"),
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