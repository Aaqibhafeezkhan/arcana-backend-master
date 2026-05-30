// newsletterJob.js
const cron = require("node-cron");
const Subscriber = require("./models/Subscriber");
const sendNewsletterEmail = require("./utils/mailer");

// Run on 13th September at 12:00 WAT
cron.schedule(
  "0 12 13 9 *",
  async () => {
    try {
      const subs = await Subscriber.find();

      for (const sub of subs) {
        try {
          await sendNewsletterEmail(
            sub.email,
            "Arcana is Live! 🎉",
            `
            <h1>Arcana is now live! 🎉</h1>
            <p>Thank you for subscribing.</p>
            <a href="https://www.shop-arcana.store"
              style="
                display:inline-block;
                padding:10px 30px;
                background:#59493b;
                color:#fff;
                text-decoration:none;
                border-radius:4px;
                margin:20px 0;
              "
            >Visit Arcana</a>
            <hr />
            <p style="font-size:12px;color:#888;text-align:center;">
              © 2025 Arcana. All rights reserved.
            </p>
            `
          );
        } catch (err) {
          console.error(`❌ Failed to send to ${sub.email}`);
        }
      }

      console.log("✅ Newsletter job completed");
    } catch (error) {
      console.error("❌ Newsletter job failed:", error.message);
    }
  },
  {
    timezone: "Africa/Lagos",
  }
);
