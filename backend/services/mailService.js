const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send Verification Email
 * @param {Object} user 
 * @param {String} token 
 */
const sendVerificationEmail = async (user, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${token}`;
    
    const mailOptions = {
      from: `"QRAMS System" <${process.env.SMTP_FROM_EMAIL || 'myhealthtube.com@gmail.com'}>`,
      to: user.email,
      subject: 'Verify your QRAMS Account',
      html: `
        <h2>Welcome to QRAMS, ${user.name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <br/><br/>
        <p>Or copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

/**
 * Send Password Reset Email
 * @param {Object} user 
 * @param {String} token 
 */
const sendPasswordResetEmail = async (user, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    const mailOptions = {
      from: `"QRAMS System" <${process.env.SMTP_FROM_EMAIL || 'myhealthtube.com@gmail.com'}>`,
      to: user.email,
      subject: 'Password Reset Request - QRAMS',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="background-color: #008CBA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <br/><br/>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * Send Project Ping Email (Admin to Manager)
 * @param {Object} project 
 * @param {Object} manager 
 */
const sendProjectPingEmail = async (project, manager) => {
  try {
    const mailOptions = {
      from: `"QRAMS Admin" <${process.env.SMTP_FROM_EMAIL || 'myhealthtube.com@gmail.com'}>`,
      to: manager.email,
      subject: 'Reminder: Submit Project Report',
      html: `
        <h2>Project Report Reminder</h2>
        <p>Hello ${manager.name},</p>
        <p>This is a reminder from the admin to submit the latest report for your project: <strong>${project.title}</strong>.</p>
        <p>Please log in to the system and upload the required documents as soon as possible.</p>
        <br/>
        <p>Thank you,</p>
        <p>QRAMS Administration</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Project ping email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending project ping email:', error);
    return false;
  }
};

/**
 * Send Report Submission Email (Manager to Admin)
 * @param {Object} project 
 * @param {Object} admin 
 */
const sendReportSubmissionEmail = async (project, admin) => {
  try {
    const mailOptions = {
      from: `"QRAMS System" <${process.env.SMTP_FROM_EMAIL || 'myhealthtube.com@gmail.com'}>`,
      to: admin.email,
      subject: 'Report Submitted',
      html: `
        <h2>New Project Report Submitted</h2>
        <p>Hello ${admin.name},</p>
        <p>A new report for project <strong>${project.title}</strong> has been submitted by the project manager.</p>
        <p>Please review the submission in the dashboard.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Report submission email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending report submission email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendProjectPingEmail,
  sendReportSubmissionEmail,
};
