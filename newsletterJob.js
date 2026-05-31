const cron = require("node-cron");
const Subscriber = require("./models/Subscriber");
const Newsletter = require("./models/Newsletter");
const { sendEmail, baseEmailTemplate } = require("./utils/emailService");

// Run on 13th September at 12:00 WAT
cron.schedule(
  "0 12 13 9 *",
  async () => {
    try {
      const subs = await Subscriber.find();
      if (subs.length === 0) {
        console.log("No subscribers found.");
        return;
      }

      const subject = "Arcana Newsletter — Designed With Intention";
      const content = `
        <div class="animate-fade-up delay-1">
          <div class="heading">The Inner <span class="heading-accent">Circle</span></div>
          <div class="subheading">Your monthly dose of intention, craft, and timeless design.</div>
        </div>
        <div class="content animate-fade-up delay-2">
          <p>This month's highlights:</p>
          <ul>
            <li>Behind the scenes at the Arcana atelier</li>
            <li>Early access to our upcoming drop</li>
            <li>Styling notes from the studio</li>
          </ul>
          <div class="divider"></div>
          <div class="quote">"The best things in life are the people we love, the places we've been, and the memories we've made along the way."</div>
          <div class="btn-wrap">
            <a href="https://www.shop-arcana.store" class="btn">Visit Arcana</a>
          </div>
        </div>
      `;

      const html = baseEmailTemplate(content, subject);
      let sentCount = 0;

      for (const sub of subs) {
        try {
          await sendEmail({ to: sub.email, subject, html });
          sentCount++;
        } catch (err) {
          console.error(`❌ Failed to send to ${sub.email}`);
        }
      }

      // Track in database
      await Newsletter.create({
        subject,
        content,
        recipientCount: sentCount,
        sentAt: new Date()
      });

      console.log(`✅ Newsletter job completed. Sent to ${sentCount} subscribers.`);
    } catch (error) {
      console.error("❌ Newsletter job failed:", error.message);
    }
  },
  {
    timezone: "Africa/Lagos",
  }
);