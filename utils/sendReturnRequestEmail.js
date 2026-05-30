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

    const title = type === "exchange" ? "Exchange Request Received" : "Return Request Received";

    const content = `
      <div class="animate-fade-up delay-1">
        <div class="heading">${type === "exchange" ? "Exchange" : "Return"} <span class="heading-accent">Request</span></div>
        <div class="subheading">We've received your ${type} request for order #${orderNumber}.</div>
      </div>
      <div class="content animate-fade-up delay-2">
        <p>Hi ${user.name},</p>
        <p>Reason: <em style="color: #8B6A4E; font-style: italic;">${reason}</em></p>
        <div class="info-box animate-fade-up delay-3">
          <p><strong style="font-family: 'Playfair Display', serif;">What Happens Next:</strong></p>
          <div style="margin-top: 16px;">
            <div class="step"><div class="step-num">1</div><div class="step-text">We'll review your request within 48 hours</div></div>
            <div class="step"><div class="step-num">2</div><div class="step-text">You'll receive a ${type} shipping label via email</div></div>
            <div class="step"><div class="step-num">3</div><div class="step-text">${type === "exchange" ? "Your replacement will be shipped once we receive the original item" : "Once received, your refund processes within 5–7 business days"}</div></div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="info-box animate-fade-up">
          <p><strong style="font-family: 'Playfair Display', serif;">Order Details:</strong><br>
          <span style="color: #3d3025;">
            Order #${orderNumber}<br>
            Shipping Address: ${shippingAddress?.street || ""}, ${shippingAddress?.city || ""}, ${shippingAddress?.state || ""}, ${shippingAddress?.country || ""}<br>
            Phone: ${phoneNumber || "N/A"}<br>
            Total Paid: $${totalPrice.toFixed(2)} ($${(totalPrice - shippingFee).toFixed(2)} + $${shippingFee.toFixed(2)} shipping)
          </span></p>
        </div>
        <p class="small">Note: Shipping fees for returns are covered by the customer. Questions? <a href="mailto:support@mail.shop-arcana.store">support@mail.shop-arcana.store</a></p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      cc: ["arcanashopng@gmail.com", "nwagudavidisaac@gmail.com"],
      subject: `Arcana ${title} — #${orderNumber}`,
      html: baseEmailTemplate(content, title),
    });
  } catch (err) {
    console.error("❌ sendReturnRequestEmail error:", err.message);
  }
};