const { sendEmail, baseEmailTemplate } = require("./emailService");

async function sendOrderEmails({ user, order, exchangeRate = 1547.3 }) {
  try {
    const { email, name, phone } = user;
    const address = user.addresses?.[0] || {};
    const orderId = order.orderNumber;

    const productsList = order.products
      .map(
        (p) => `
        <div class="product" style="display:flex;gap:15px;align-items:center;margin-bottom:15px;animation:fadeIn 0.5s ease forwards;">
          <img src="${p.image}" alt="${p.title || p.name}" style="width:120px;border-radius:5px;" />
          <div class="product-info">
            <p>${p.title || p.name} (${p.size}) x${p.quantity} — ₦${(p.price * exchangeRate * p.quantity).toFixed(2)}</p>
            <span class="badge" style="background:#e89b4b;color:#fff;font-size:12px;padding:2px 6px;border-radius:3px;animation:pulse 1.5s infinite;">🔥 Hot!</span>
          </div>
        </div>
      `
      )
      .join("");

    const isNigeria = address.country?.toLowerCase().includes("nigeria");
    const deliveryMessage = isNigeria
      ? "Delivery within 10–15 business days (Nigeria)"
      : "Delivery within 2–3 weeks (International)";

    const adminContent = `
      <div class="status-banner" style="background:#f7d19b;padding:12px;text-align:center;font-weight:bold;border-radius:5px;margin:20px 0;animation:slideIn 0.8s ease forwards;">
        🛒 New Order Received (ID: ${orderId})
      </div>
      <p>
        <strong>Name:</strong> ${name}<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Phone:</strong> ${phone}<br>
        <strong>Address:</strong> ${address.street || ""}, ${address.city || ""}, ${address.state || ""}, ${address.country || ""}
      </p>
      <h2>Products:</h2>
      ${productsList}
      <p><strong>Products Total:</strong> ₦${((order.totalPrice - order.shippingFee) * exchangeRate).toFixed(2)}</p>
      <p><strong>Shipping Fee:</strong> ₦${(order.shippingFee * exchangeRate).toFixed(2)}</p>
      <p><strong>Total Paid:</strong> ₦${(order.totalPrice * exchangeRate).toFixed(2)}</p>
      <p><strong>Delivery:</strong> ${deliveryMessage}</p>
    `;

    const userContent = `
      <div class="status-banner" style="background:#f7d19b;padding:12px;text-align:center;font-weight:bold;border-radius:5px;margin:20px 0;animation:slideIn 0.8s ease forwards;">
        ✅ Order Confirmed!
      </div>
      <h3>Hi ${name},</h3> 
      <p>Thank you for shopping at Arcana. 🤎</p>
      <p>Your order <strong>#${orderId}</strong> has been successfully confirmed.</p>
      <h2>Products Ordered:</h2>
      ${productsList}
      <p>
        <a href="https://shop-arcana.store/order_status.html?orderId=${order.orderNumber}" style="display:inline-block;padding:10px 30px;background:#59493b;color:#fff;border-radius:5px;text-decoration:none;">
          Track My Order
        </a>
      </p>
      <p><strong>Products Total:</strong> ₦${((order.totalPrice - order.shippingFee) * exchangeRate).toFixed(2)}</p>
      <p><strong>Shipping Fee:</strong> ₦${(order.shippingFee * exchangeRate).toFixed(2)}</p>
      <p><strong>Total Paid:</strong> ₦${(order.totalPrice * exchangeRate).toFixed(2)}</p>
      <p><strong>Shipping To:</strong> ${address.street || ""}, ${address.city || ""}, ${address.state || ""}, ${address.country || ""}</p>
      <p>${deliveryMessage}</p>
      <p>We'll email you again when your order ships 🤎</p>
      <p>Best Regards,<br>The Arcana Team</p>
    `;

    const footerHTML = `
      <hr />
      <p>Arcana — Designed with intention.</p>
      <p>Need help? Contact <a href="mailto:arcanashopng@gmail.com" style="color:#000;text-decoration:none;">arcanashopng@gmail.com</a></p>
      <p>© ${new Date().getFullYear()} Arcana. All rights reserved.</p>
    `;

    sendEmail({
      to: email,
      subject: `🛍️ Arcana — Order Confirmed (ID: ${orderId})`,
      html: baseEmailTemplate("Order Confirmed", userContent, footerHTML)
    });

    sendEmail({
      to: ["arcanashopng@gmail.com", "nwagudavidisaac@gmail.com"],
      subject: `📦 New Order Received — Arcana (ID: ${orderId})`,
      html: baseEmailTemplate("New Order Notification", adminContent, footerHTML)
    });
  } catch (err) {
    console.error("❌ sendOrderEmails error:", err.message);
  }
}

module.exports = sendOrderEmails;