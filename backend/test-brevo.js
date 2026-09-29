const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: '"SQRMT System" <myhealthtube.com@gmail.com>',
      to: 'utsavjha.me@gmail.com', // Sending to the user's primary email
      subject: 'Strict SMTP Test',
      text: 'Trying to debug this brevo issue.',
    });
    console.log("Success! Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (err) {
    console.error("Failed to send email!");
    console.error(err);
  }
}

main();
