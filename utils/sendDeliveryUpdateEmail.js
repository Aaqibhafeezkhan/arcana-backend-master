const { sendEmail } = require('./emailService');
const { baseEmailTemplate } = require('./mailer');

const sendDeliveryUpdateEmail = async (order, user, deliveryStage, newOrderId) => {
  let title, content;

  if (deliveryStage === 'Shipped') {
    title = 'Your Arcana Order Has Shipped';
    content = `
      <div class="animate-fade-up delay-1">
        <div class="heading">In <span class="heading-accent">Transit</span></div>
        <div class="subheading">Your Arcana order is now on its way to you, ${user.name}.</div>
      </div>
      <div class="status-wrap animate-scale delay-2"><span class="status-badge shipped">SHIPPED</span></div>
      <div class="info-box animate-fade-up delay-2">
        <p><strong style="font-family: 'Playfair Display', serif; font-size: 16px;">Order #${order.orderNumber}</strong><br>
        <span style="color: #8B6A4E; font-size: 13px;">Tracking: ${order.trackingNumber || 'Will be updated shortly'}</span></p>
      </div>
      <div class="content animate-fade-up delay-3">
        <p>Your package is in transit and should arrive within 3–5 business days. Use your tracking number above to follow its journey.</p>
        <div class="divider"></div>
        <p class="small">Need to modify your delivery details? Contact us immediately at <a href="mailto:support@mail.shop-arcana.store">support@mail.shop-arcana.store</a></p>
      </div>
    `;
  } else if (deliveryStage === 'Delivered') {
    title = 'Your Arcana Order Was Delivered';
    content = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Delivered <span class="heading-accent">With Care</span></div>
        <div class="subheading">Your Arcana order has arrived, ${user.name}.</div>
      </div>
      <div class="status-wrap animate-scale delay-2"><span class="status-badge delivered">DELIVERED</span></div>
      <div class="info-box animate-fade-up delay-2">
        <p><strong style="font-family: 'Playfair Display', serif; font-size: 16px;">Order #${order.orderNumber}</strong><br>
        <span style="color: #8B6A4E; font-size: 13px;">Delivered on ${new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
      </div>
      <div class="content animate-fade-up delay-3">
        <p>We hope these pieces find their place in your story. Each item was crafted with intention — wear them with the same care that went into making them.</p>
        <div class="divider"></div>
        <p class="small">Share your look with <strong style="color: #59493b;">@arcana.ng</strong> or reply to this email with your thoughts.</p>
      </div>
    `;
  } else if (deliveryStage === 'Exchanged') {
    title = 'Your Arcana Exchange Is Ready';
    content = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Exchange <span class="heading-accent">Processed</span></div>
        <div class="subheading">Your exchange request has been processed, ${user.name}.</div>
      </div>
      <div class="info-box animate-fade-up delay-2">
        <p><strong style="font-family: 'Playfair Display', serif; font-size: 16px;">New Order #${newOrderId}</strong><br>
        <span style="color: #8B6A4E; font-size: 13px;">Your replacement order is now being prepared.</span></p>
      </div>
      <div class="content animate-fade-up delay-3">
        <p>We've processed your exchange and your new items are being prepared with the same care as every Arcana piece.</p>
      </div>
    `;
  }

  const html = baseEmailTemplate(content, title);

  await sendEmail({
    to: user.email,
    subject: title,
    html,
  });
};

module.exports = sendDeliveryUpdateEmail;