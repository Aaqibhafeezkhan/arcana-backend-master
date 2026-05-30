const cron = require('node-cron');
const { sendEmail } = require('./utils/emailService');
const { baseEmailTemplate } = require('./utils/mailer');

// Runs on September 13 at 12:00 PM (WAT)
cron.schedule('0 12 13 9 *', async () => {
  console.log('Running newsletter job...');

  try {
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
      </div>
    `;

    await sendEmail({
      to: 'subscribers@example.com', // Replace with actual subscriber list
      subject: 'Arcana Newsletter — Designed With Intention',
      html: baseEmailTemplate(content, 'Arcana Newsletter'),
    });
    console.log('Newsletter sent successfully');
  } catch (error) {
    console.error('Newsletter job failed:', error);
  }
});

console.log('Newsletter job scheduled');
