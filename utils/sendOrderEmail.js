const { sendEmail, baseEmailTemplate } = require("./emailService");

async function sendOrderEmails({ user, order, exchangeRate = 1547.3 }) {
  try {
    const { email, name, phone } = user;
    const address = user.addresses?.[0] || {};
    const orderId = order.orderNumber;

    const itemsHtml = order.products.map(p => `
      <tr class="animate-fade-up">
        <td style="display: flex; align-items: center; gap: 18px;">
          <img src="${p.image}" alt="${p.title || p.name}" class="product-img" style="width: 72px; height: 72px; object-fit: cover; border: 1px solid rgba(89,73,59,0.08);">
          <div>
            <div style="font-weight: 600; color: #2a2119; font-size: 14.5px; letter-spacing: -0.3px;">${p.title || p.name}</div>
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

    const isNigeria = address.country?.toLowerCase().includes("nigeria");
    const deliveryMessage = isNigeria
      ? "Delivery within 10–15 business days"
      : "Delivery within 2–3 weeks (International)";

    // ─── USER EMAIL ───
    const userContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Order <span class="heading-accent">Confirmed</span></div>
        <div class="subheading">Thank you, ${name}. Your pieces are being prepared with the care they deserve.</div>
      </div>
      <div class="status-wrap animate-scale delay-2"><span class="status-badge">${order.status.toUpperCase()}</span></div>
      <div class="info-box animate-fade-up delay-2">
        <p><strong style="font-family: 'Playfair Display', serif; font-size: 16px;">Order #${orderId}</strong><br>
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
        <span style="color: #3d3025;">${address.street || ''}<br>
        ${address.city || ''}, ${address.state || ''}<br>
        ${address.country || ''} ${address.postalCode || ''}</span></p>
      </div>
      <div class="content animate-fade-up">
        <p>${deliveryMessage}</p>
        <div class="btn-wrap">
          <a href="https://shop-arcana.store/order_status.html?orderId=${orderId}" class="btn">Track My Order</a>
        </div>
        <p class="small">We'll notify you the moment your order ships. Questions? Reach us at <a href="mailto:support@mail.shop-arcana.store">support@mail.shop-arcana.store</a></p>
      </div>
    `;

    // ─── ADMIN EMAIL ───
    const adminContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">New <span class="heading-accent">Order</span></div>
        <div class="subheading">A new order has been placed on Arcana.</div>
      </div>
      <div class="info-box animate-fade-up delay-2">
        <p><strong style="font-family: 'Playfair Display', serif; font-size: 16px;">Order #${orderId}</strong><br>
        <span style="color: #8B6A4E; font-size: 13px;">${new Date(order.createdAt).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
        <p style="margin-top: 16px; font-size: 14px; line-height: 1.75; color: #3d3025;">
          <strong>Customer:</strong> ${name}<br>
          <strong>Email:</strong> ${email}<br>
          <strong>Phone:</strong> ${phone || 'N/A'}<br>
          <strong>Address:</strong> ${address.street || ''}, ${address.city || ''}, ${address.state || ''}, ${address.country || ''}
        </p>
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
      <div class="content animate-fade-up">
        <p><strong>Delivery:</strong> ${deliveryMessage}</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: `Arcana Order Confirmation — #${orderId}`,
      html: baseEmailTemplate(userContent, `Order Confirmed — #${orderId}`),
    });

    await sendEmail({
      to: ["arcanashopng@gmail.com", "nwagudavidisaac@gmail.com"],
      subject: `New Arcana Order — #${orderId}`,
      html: baseEmailTemplate(adminContent, `New Order — #${orderId}`),
    });

  } catch (err) {
    console.error("❌ sendOrderEmails error:", err.message);
  }
}

module.exports = sendOrderEmails;