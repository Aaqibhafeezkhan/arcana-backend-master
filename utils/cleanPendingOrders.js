const cron = require("node-cron");
const Order = require("../models/Order");
const { sendEmail, baseEmailTemplate } = require("./emailService");

const ADMIN_EMAILS = [
  "arcanashopng@gmail.com",
  "nwagudavidisaac@gmail.com",
];

// Orders that are still Pending after EXPIRY_MINUTES are deleted.
// 30 minutes gives Paystack enough time to complete the transaction and
// deliver the webhook before the cron removes the order.
const EXPIRY_MINUTES = 30;

cron.schedule("* * * * *", async () => {
  const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);

  try {
    const expiredOrders = await Order.find({
      status: "Pending",
      createdAt: { $lt: cutoff },
    }).populate("user", "email name");

    if (!expiredOrders.length) return;

    const orderIds = expiredOrders.map((o) => o._id);
    await Order.deleteMany({ _id: { $in: orderIds } });

    console.log(`🗑️ Deleted ${expiredOrders.length} expired orders`);

    const adminList = expiredOrders
      .map(
        (order) => `
        <tr class="animate-fade-up">
          <td style="padding: 14px 0; border-bottom: 1px solid rgba(89,73,59,0.08); font-size: 14px; color: #3d3025;">
            <strong style="font-family: 'Playfair Display', serif;">#${order.orderNumber}</strong><br>
            <span style="font-size: 12px; color: #8B6A4E;">${order.user?.name || "Unknown"} — ${order.user?.email || "N/A"}</span>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid rgba(89,73,59,0.08); font-size: 13px; color: #8B6A4E; text-align: right;">
            ${order.createdAt.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </td>
        </tr>
      `
      )
      .join("");

    const adminContent = `
      <div class="animate-fade-up delay-1">
        <div class="heading">Expired Orders <span class="heading-accent">Cleared</span></div>
        <div class="subheading">${expiredOrders.length} pending order(s) were automatically removed after the 10-minute payment window.</div>
      </div>
      <table class="order-table" style="margin-top: 28px;">
        <thead><tr><th>Order</th><th style="text-align: right;">Created</th></tr></thead>
        <tbody>${adminList}</tbody>
      </table>
      <div class="content animate-fade-up">
        <p class="small">These orders have been deleted from the database and inventory has been restored.</p>
      </div>
    `;

    await sendEmail({
      to: ADMIN_EMAILS,
      subject: "⏰ Expired Pending Orders Deleted",
      html: baseEmailTemplate(adminContent, "Expired Orders Cleared"),
    });

    for (const order of expiredOrders) {
      if (!order.user?.email) continue;

      const userContent = `
        <div class="animate-fade-up delay-1">
          <div class="heading">Order <span class="heading-accent">Expired</span></div>
          <div class="subheading">Your order #${order.orderNumber} was not completed within the payment window.</div>
        </div>
        <div class="content animate-fade-up delay-2">
          <p>Hi ${order.user.name || "there"},</p>
          <p>We reserved your selections for 10 minutes, but the payment window has now closed. Order <strong>#${order.orderNumber}</strong> has been automatically released.</p>
          <div class="info-box animate-fade-up delay-3">
            <p><strong>This was a mistake?</strong><br>No worries — you can return to our store and place a fresh order at any time. Your items are still available (subject to stock).</p>
          </div>
          <div class="btn-wrap">
            <a href="https://shop-arcana.store" class="btn">Shop Arcana</a>
          </div>
          <p class="small">Questions? Reach us at <a href="mailto:arcanashopng@gmail.com">arcanashopng@gmail.com</a></p>
        </div>
      `;

      await sendEmail({
        to: order.user.email,
        subject: "❌ Your Order Has Expired",
        html: baseEmailTemplate(userContent, "Order Expired"),
      });
    }
  } catch (err) {
    console.error("❌ cleanPendingOrders cron error:", err.message);
  }
});