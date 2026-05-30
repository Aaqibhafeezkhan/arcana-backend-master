const { sendEmail, baseEmailTemplate, LOGO_URL } = require("./emailService");

async function sendNewsletterEmail(to, subject, html) {
  try {
    await sendEmail({ to, subject, html });
    console.log(`📧 Newsletter email sent to ${to}`);
  } catch (error) {
    console.error("❌ Newsletter email failed:", error.message);
    throw error;
  }
}

// Attach named exports for backward compatibility with destructuring imports
sendNewsletterEmail.baseEmailTemplate = baseEmailTemplate;
sendNewsletterEmail.LOGO_URL = LOGO_URL;

module.exports = sendNewsletterEmail;