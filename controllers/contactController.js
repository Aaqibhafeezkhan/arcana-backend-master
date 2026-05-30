const { sendEmail } = require('../utils/emailService');
const { baseEmailTemplate } = require('../utils/mailer');

const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Send to admin
    await sendEmail({
      to: 'arcanashopng@gmail.com',
      cc: 'nwagudavidisaac@gmail.com',
      subject: `New Contact Message from ${name}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
    }).catch(() => {});

    // Auto-reply to user with modern design
    const autoReplyContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Message <span class="heading-accent">Received</span></div>
        <div class="subheading">Thank you for reaching out, ${name}.</div>
      </div>
      <div class="content animate-fade-up delay-2">
        <p>We've received your message and hold it with the same attention we give every detail of our craft. A response will reach you within 24 hours.</p>
        <div class="divider"></div>
        <p class="small">For urgent matters, contact us directly at <a href="mailto:support@mail.shop-arcana.store">support@mail.shop-arcana.store</a></p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Arcana — We've Received Your Message",
      html: baseEmailTemplate(autoReplyContent, 'Message Received'),
    }).catch(() => {});

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { sendContactMessage };