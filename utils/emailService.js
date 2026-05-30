const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, cc }) => {
  try {
    const options = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      reply_to: 'arcanashopng@gmail.com',
    };
    if (cc) options.cc = cc;

    const response = await resend.emails.send(options);
    console.log('Email sent:', response);
    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = { sendEmail, resend };