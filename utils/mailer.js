// utils/mailer.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNewsletterEmail(to, subject, html) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM, // e.g. "Arcana <support@mail.shop-arcana.store>"
      to,
      subject,
      html,
    });

    console.log(`📧 Newsletter email sent to ${to}`);
  } catch (error) {
    console.error("❌ Newsletter email failed:", error.message);
    throw error;
  }
}

module.exports = sendNewsletterEmail;
