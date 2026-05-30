const { sendEmail } = require('./emailService');
const { baseEmailTemplate } = require('./mailer');

const sendOrderEmails = async (order, user) => {
  const exchangeRate = 1547.3;

  const itemsHtml = order.products.map(p => `
    <tr class="animate-fade-up">
      <td style="display: flex; align-items: center; gap: 18px;">
        <img src="${p.image}" alt="${p.title}" class="product-img" style="width: 72px; height: 72px; object-fit: cover; border: 1px solid rgba(89,73,59,0.08);">
        <div>
          <div style="font-weight: 600; color: #2a2119; font-size: 14.5px; letter-spacing: -0.3px;">${p.title}</div>
          <div style="font-size: 11px; color: #8B6A4E; margin-top: 6px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500;">Size ${p.size}</div>
        </div>
      </td>
      <td style="text-align: center; color: #8B6A4E; font-weight: 500;">${p.quantity}</td>
      <td style="text-align: right; font-weight: 600; color: #2a2119; font-family: 'Playfair Display', serif; font-size: 15px;">₦${(p.price * exchangeRate * p.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const subtotal = order.products.reduce((sum, p) => sum + (p.price * exchangeRate * p.quantity), 0);
  const shippingNaira = (order.shippingFee * exchangeRate).toFixed(2);
  const totalNaira = (subtotal + parseFloat(shippingNaira)).toFixed(2);

  const content = `
    <div class="animate-fade-up delay-1">
      <div class="heading">Order <span class="heading-accent">Confirmed</span></div>
      <div class="subheading">Thank you, ${user.name}. Your pieces are being prepared with the care they deserve.</div>
    </div>
    <div class="status-wrap animate-scale delay-2"><span class="status-badge">${order.status.toUpperCase()}</span></div>
    <div class="info-box animate-fade-up delay-2">
      <p><strong style="font-family: 'Playfair Display', serif; font-size: 16px;">Order #${order.orderNumber}</strong><br>
      <span style="color: #8B6A4E; font-size: 13px;">${new Date(order.createdAt).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
    </div>
    <table class="order-table">
      <thead><tr><th>Item</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Price</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr><td colspan="2" style="text-align: right; color: #8B6A4E;">Subtotal</td><td style="text-align: right; font-weight: 500;">₦${subtotal.toFixed(2)}</td></tr>
        <tr><td colspan="2" style="text-align: right; color: #8B6A4E;">Shipping</td><td style="text-align: right; font-weight: 500;">₦${shippingNaira}</td></tr>
        <tr><td colspan="2" style="text-align: right;" class="total">Total</td><td style="text-align: right;" class="total">₦${totalNaira}</td></tr>
      </tfoot>
    </table>
    <div class="info-box animate-fade-up">
      <p><strong style="font-family: 'Playfair Display', serif;">Shipping to:</strong><br>
      <span style="color: #3d3025;">${order.shippingAddress.street}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
      ${order.shippingAddress.country} ${order.shippingAddress.postalCode || ''}</span></p>
    </div>
    <p class="small animate-fade-up" style="margin-top: 28px;">We'll notify you the moment your order ships. Questions? Reach us at <a href="mailto:support@mail.shop-arcana.store">support@mail.shop-arcana.store</a></p>
  `;

  const html = baseEmailTemplate(content, `Order Confirmed — #${order.orderNumber}`);

  await sendEmail({
    to: user.email,
    subject: `Arcana Order Confirmation — #${order.orderNumber}`,
    html,
  });

  await sendEmail({
    to: 'arcanashopng@gmail.com',
    cc: 'nwagudavidisaac@gmail.com',
    subject: `New Arcana Order — #${order.orderNumber}`,
    html,
  });
};

module.exports = sendOrderEmails;