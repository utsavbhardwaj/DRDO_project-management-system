const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: Number(process.env.SMTP_PORT) || 2525,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || process.env.SMTP_EMAIL || 'test',
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || 'test'
      }
    });

    const message = {
      from: `${process.env.FROM_NAME || 'SQRMT Admin'} <${process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'admin@sqrmt.drdo.gov.in'}>`,
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
