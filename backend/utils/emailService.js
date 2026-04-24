const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_EMAIL || 'test',
        pass: process.env.SMTP_PASSWORD || 'test'
      }
    });

    const message = {
      from: `${process.env.FROM_NAME || 'QRAMS Admin'} <${process.env.FROM_EMAIL || 'admin@qrams.drdo.gov.in'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email', error);
  }
};

module.exports = sendEmail;
