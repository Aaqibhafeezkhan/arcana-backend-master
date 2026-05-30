const { sendEmail } = require('./emailService');
const { baseEmailTemplate } = require('./mailer');

const sendReturnRequestEmail = async (order, user, reason, type) => {
  const title = type === 'exchange' ? 'Exchange Request Received' : 'Return Request Received';

  const content = `
    <div class="animate-fade-up delay-1">
      <div class="heading">${type === 'exchange' ? 'Exchange' : 'Return'} <span class="heading-accent">Request</span></div>
      <div class="subheading">We've received your ${type} request for order #${order.orderNumber}.</div>
    </div>
    <div class="content animate-fade-up delay-2">
      <p>Hi ${user.name},</p>
      <p>Reason: <em style="color: #8B6A4E; font-style: italic;">${reason}</em></p>
      <div class="info-box animate-fade-up delay-3">
        <p><strong style="font-family: 'Playfair Display', serif;">What Happens Next:</strong></p>
        <div style="margin-top: 16px;">
          <div class="step"><div class="step-num">1</div><div class="step-text">We'll review your request within 48 hours</div></div>
          <div class="step"><div class="step-num">2</div><div class="step-text">You'll receive a ${type} shipping label via email</div></div>
          <div class="step"><div class="step-num">3</div><div class="step-text">${type === 'exchange' ? 'Your replacement will be shipped once we receive the original item' : 'Once received, your refund processes within 5–7 business days'}</div></div>
        </div>
      </div>
      <p class="small">Questions? <a href="mailto:support@mail.shop-arcana.store">support@mail.shop-arcana.store</a></p>
    </div>
  `;

  const html = baseEmailTemplate(content, title);

  await sendEmail({
    to: user.email,
    subject: `Arcana ${title}`,
    html,
  });
};

module.exports = sendReturnRequestEmail;