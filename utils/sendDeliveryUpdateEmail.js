const { sendEmail, baseEmailTemplate } = require("./emailService");

module.exports = async function sendDeliveryUpdateEmail(order) {
  try {
    const {
      user,
      deliveryStage,
      orderNumber,
      shippingAddress,
      totalPrice,
      products,
      shippingFee = 0,
      newOrderId,
    } = order;

    if (!user?.email) return;

    const isNigerian = shippingAddress?.country?.toLowerCase() === "nigeria";

    const deliveryTime =
      deliveryStage === "Shipped"
        ? isNigerian ? "10–15 business days" : "2–3 weeks"
        : "It was delivered to your address";

    let subject = `Your Order ${orderNumber} update`;
    if (deliveryStage === "Shipped") subject = `📦 Your Order ${orderNumber} has been shipped`;
    if (deliveryStage === "Delivered") subject = `✅ Your Order ${orderNumber} has been delivered`;

    const orderDetails = products
      .map(
        (p) => `
        <div class="product" style="display:flex;gap:15px;align-items:center;margin-bottom:15px;animation:fadeIn 0.5s ease forwards;">
          <img src="${p.image}" alt="${p.title}" style="width:120px;border-radius:5px;" />
          <div class="product-info">
            <strong>${p.title}</strong> (${p.size}) — Qty: ${p.quantity}
          </div>
        </div>
      `
      )
      .join("");

    const contentHTML = `

      <div class="status-banner" style="background:#f7d19b;padding:12px;text-align:center;font-weight:bold;border-radius:5px;margin:20px 0;animation:slideIn 0.8s ease forwards;">
        📦 Order ${deliveryStage}!
      </div>

      <h3>Hi ${user.name}</h3>

      <p>Your order <strong>${orderNumber}</strong> has been <strong>${deliveryStage.toLowerCase()}</strong>.</p>

      ${deliveryStage === "Exchanged" ? `<p>Your new Order ID is: <strong>${newOrderId || "Pending"}</strong></p>` : ""}

      <h2>Order Details</h2>
      ${orderDetails}

      <p>
        <a href="https://shop-arcana.store/order_status.html?orderId=${orderNumber}" style="display:inline-block;padding:10px 30px;background:#59493b;color:#fff;border-radius:5px;text-decoration:none;">
          Track My Order
        </a>
      </p>

      <p><strong>Delivery:</strong> ${deliveryTime}</p>
      <p><strong>Shipped to:</strong> ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country}</p>
      <p><strong>Products Total:</strong> $${(totalPrice - shippingFee).toFixed(2)}</p>
      <p><strong>Shipping Fee:</strong> $${shippingFee.toFixed(2)}</p>
      <p><strong>Total Paid:</strong> $${totalPrice.toFixed(2)}</p>

      <p style="margin-top:30px;">Thank you for shopping at Arcana! 🤎</p>
      <p>Best Regards,<br>The Arcana Team</p>
    `;

    const footerHTML = `
      <hr />
      <p>Arcana — Designed with intention.</p>
      <p>Need help? Contact <a href="mailto:arcanashopng@gmail.com" style="color:#000;text-decoration:none;">arcanashopng@gmail.com</a></p>
      <p>© ${new Date().getFullYear()} Arcana. All rights reserved.</p>
    `;

    sendEmail({
      to: user.email,
      cc: ["arcanashopng@gmail.com", "nwagudavidisaac@gmail.com"],
      subject,
      html: baseEmailTemplate(`Order ${deliveryStage}`, contentHTML, footerHTML)
    });
  } catch (err) {
    console.error("❌ sendDeliveryUpdateEmail error:", err.message);
  }
};