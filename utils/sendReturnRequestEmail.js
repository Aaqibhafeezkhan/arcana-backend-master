const { sendEmail, baseEmailTemplate } = require("./emailService");

module.exports = async function sendReturnRequestEmail(order, reason, type) {
  try {
    const {
      user,
      orderNumber,
      products,
      shippingAddress,
      phoneNumber,
      totalPrice,
      shippingFee = 0,
    } = order;

    if (!user?.email) return;

    const orderDetails = products
      .map(
        (p) => `
        <div style="margin-bottom:10px">
          <img src="${p.image}" alt="${p.title}" width="80"><br>
          <strong>${p.title}</strong> (${p.size}) — Qty: ${p.quantity}
        </div>
      `
      )
      .join("");

    const contentHTML = `
      <div style="font-family:Arial,sans-serif;color:#333;padding:20px;">
        <h2>Hi ${user.name},</h2>
        <p>We have received your request for a <strong>${type}</strong> on order <strong>${orderNumber}</strong>.</p>
        <p><strong>Reason provided:</strong> ${reason}</p>
        <p>We’ll get back to you shortly. If you have any questions, you may reach to us through our contact form or <a href="mailto:arcanashopng@gmail.com">email us</a>.</p>
        <p><strong>Note:</strong> Shipping fees for returns are covered by the customer.</p>
        <h3>Order Details</h3>
        ${orderDetails}
        <p><strong>Shipping Address:</strong> ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
        <p><strong>Total Paid:</strong> $${totalPrice.toFixed(2)} ($${(totalPrice - shippingFee).toFixed(2)} + $${shippingFee.toFixed(2)} shipping)</p>
        <p style="margin-top:30px;">Best Regards,<br>The Arcana Team</p>
      </div>
    `;

    const footerHTML = `
      <hr>
      <p style="margin:0 0 8px;">Arcana — Designed with intention.</p>
      <p style="margin:0;">
        Need help? Reply to this email or contact us at
        <a href="mailto:arcanashopng@gmail.com" style="color:#000; text-decoration:none;">arcanashopng@gmail.com</a>
      </p>
      <p style="margin:0;">© ${new Date().getFullYear()} Arcana. All rights reserved.</p>
    `;

    sendEmail({
      to: user.email,
      cc: ["arcanashopng@gmail.com", "nwagudavidisaac@gmail.com"],
      subject: `${type} Request Received — Order ${orderNumber}`,
      html: baseEmailTemplate(`${type} Request Received`, contentHTML, footerHTML)
    });
  } catch (err) {
    console.error("❌ sendReturnRequestEmail error:", err.message);
  }
};