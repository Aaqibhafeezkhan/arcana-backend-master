const cron = require("node-cron");
const Order = require("../models/Order");
const { sendEmail, baseEmailTemplate } = require("./emailService");

const ADMIN_EMAILS = [
  "arcanashopng@gmail.com",
  "nwagudavidisaac@gmail.com",
];

cron.schedule("* * * * *", async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  try {
    const expiredOrders = await Order.find({
      status: "Pending",
      createdAt: { $lt: tenMinutesAgo },
    }).populate("user", "email name");

    if (!expiredOrders.length) return;

    const orderIds = expiredOrders.map((o) => o._id);
    await Order.deleteMany({ _id: { $in: orderIds } });

    console.log(`🗑️ Deleted ${expiredOrders.length} expired orders`);

    const adminList = expiredOrders
      .map(
        (order) => `
        <li>
          <strong>Order ID:</strong> ${order.orderNumber}<br/>
          <strong>User:</strong> ${order.user?.name || "Unknown"} (${order.user?.email || "N/A"})<br/>
          <strong>Created:</strong> ${order.createdAt.toLocaleString()}
        </li>
      `
      )
      .join("");

    const commonFooter = `
      <hr>
      <p style="margin:0 0 8px;">Arcana — Designed with intention.</p>
      <p style="margin:0;">
        Need help? Reply to this email or contact us at
        <a href="mailto:arcanashopng@gmail.com" style="color:#000; text-decoration:none;">arcanashopng@gmail.com</a>
      </p>
      <p style="margin:0;">© 2025 Arcana. All rights reserved.</p>
    `;

    const adminContent = `
      <h2>⏰ Expired Pending Orders Deleted</h2>
      <p>${expiredOrders.length} pending order(s) were removed after 10 minutes:</p>
      <ul>${adminList}</ul>
    `;

    sendEmail({
      to: ADMIN_EMAILS,
      subject: "⏰ Expired Pending Orders Deleted",
      html: baseEmailTemplate("Expired Pending Orders Deleted", adminContent, commonFooter)
    });

    for (const order of expiredOrders) {
      if (!order.user?.email) continue;

      const userContent = `
        <p>Hi ${order.user.name || "there"},</p>
        <p>Your order with ID <strong>${order.orderNumber}</strong> was automatically canceled because it wasn’t paid within <strong>10 minutes</strong>.</p>
        <p>If this was a mistake, you may place the order again on our website.</p>
        <p>Best Regards,<br>Arcana Team</p>
      `;

      sendEmail({
        to: order.user.email,
        subject: "❌ Your Order Has Expired",
        html: baseEmailTemplate("Order Expired", userContent, commonFooter)
      });
    }
  } catch (err) {
    console.error("❌ cleanPendingOrders cron error:", err.message);
  }
});