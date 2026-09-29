const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.SMTP_PORT) || 2525,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
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
      from: `"SQRMT System" <${process.env.EMAIL_FROM || process.env.SMTP_FROM_EMAIL || 'myhealthtube.com@gmail.com'}>`,
      to: user.email,
      subject: 'Verify your SQRMT Account',
      html: `
        <h2>Welcome to SQRMT, ${user.name}!</h2>
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
      from: `"SQRMT - DRDO SSPL" <${process.env.EMAIL_FROM || process.env.SMTP_FROM_EMAIL || 'noreply@sspl.drdo.in'}>`,
      to: user.email,
      subject: '🔐 Password Reset Request — SQRMT | Solid State Physics Laboratory',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:30px 0;">
            <tr><td align="center">
              <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#003366,#0077cc);padding:28px 36px;text-align:center;">
                    <p style="color:#ffd700;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px 0;">Solid State Physics Laboratory · New Delhi</p>
                    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 4px 0;">SQRMT Security Alert</h1>
                    <p style="color:#b3d4f0;font-size:12px;margin:0;">SSPL Quality Reliability Monitoring and Tracking</p>
                  </td>
                </tr>

                <!-- Lock icon banner -->
                <tr>
                  <td style="background:#e8f0fb;padding:20px;text-align:center;border-bottom:1px solid #d0dff0;">
                    <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:14px;border:2px solid #2a5494;">
                      <span style="font-size:28px;">🔐</span>
                    </div>
                    <p style="color:#003366;font-size:16px;font-weight:700;margin:10px 0 0 0;">Password Reset Request</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px 36px;">
                    <p style="color:#333;font-size:15px;margin:0 0 12px 0;">Hello <strong>${user.name}</strong>,</p>
                    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
                      We received a request to reset the password for your SQRMT account associated with this email address.
                      Click the button below to create a new password:
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:8px 0 24px 0;">
                          <a href="${resetUrl}" style="background:linear-gradient(135deg,#003366,#0077cc);color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;letter-spacing:0.5px;">
                            Reset My Password →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Warning box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:14px 18px;">
                          <p style="color:#7a5c00;font-size:12px;font-weight:700;margin:0 0 6px 0;">⏱ Important Security Notice:</p>
                          <ul style="color:#7a5c00;font-size:12px;margin:0;padding-left:18px;line-height:1.7;">
                            <li>This link expires in <strong>1 hour</strong></li>
                            <li>If you did not request this reset, <strong>ignore this email</strong> — your password will not change</li>
                            <li>Never share this link with anyone</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <!-- Fallback link -->
                    <p style="color:#888;font-size:11px;margin:20px 0 0 0;">
                      If the button above doesn't work, copy and paste this URL into your browser:<br/>
                      <a href="${resetUrl}" style="color:#2a5494;word-break:break-all;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8f9fa;padding:18px 36px;border-top:1px solid #e0e0e0;text-align:center;">
                    <p style="color:#999;font-size:11px;margin:0;">
                      This is an automated security message from SQRMT · DRDO Solid State Physics Laboratory<br/>
                      New Delhi · Do not reply to this email
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
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
const sendProjectPingEmail = async (project, manager, remarks = '') => {
  try {
    const mailOptions = {
      from: `"SQRMT Admin" <${process.env.EMAIL_FROM || process.env.SMTP_FROM_EMAIL || 'myhealthtube.com@gmail.com'}>`,
      to: manager.email,
      subject: 'Reminder: Submit Project Report',
      html: `
        <h2>Project Report Reminder</h2>
        <p>Hello ${manager.name},</p>
        <p>This is a reminder from the admin to submit the latest report for your project: <strong>${project.title}</strong>.</p>
        <p>Please log in to the system and upload the required documents as soon as possible.</p>
        
        ${remarks ? `
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #eab308; background-color: #fefce8; border-top: 1px solid #fef08a; border-right: 1px solid #fef08a; border-bottom: 1px solid #fef08a; border-radius: 4px; font-family: sans-serif;">
          <strong style="color: #854d0e; font-size: 14px; display: block; margin-bottom: 6px;">Message/Remarks from Admin:</strong>
          <p style="margin: 0; font-style: italic; white-space: pre-wrap; color: #713f12; font-size: 14px; line-height: 1.5;">${remarks}</p>
        </div>
        ` : ''}
        
        <br/>
        <p>Thank you,</p>
        <p>SQRMT Administration</p>
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
      from: `"SQRMT System" <${process.env.EMAIL_FROM || process.env.SMTP_FROM_EMAIL || 'myhealthtube.com@gmail.com'}>`,
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

/**
 * Send Quality Format Submission Email (Member → Admin)
 * @param {Object} admin         - admin user object
 * @param {Object} member        - member user object
 * @param {Object} project       - project object
 * @param {String} reportType    - e.g. "Quality Objective"
 * @param {String} entryId       - the id of the submitted entry
 * @param {String} formatKey     - e.g. "objectives"
 */
const sendQualitySubmissionEmail = async (admin, member, project, reportType, entryId, formatKey) => {
  try {
    const viewUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/quality/${project.id}/${formatKey}`;

    const mailOptions = {
      from: `"SQRMT - DRDO SSPL" <${process.env.EMAIL_FROM || process.env.SMTP_FROM_EMAIL || 'noreply@sspl.drdo.in'}>`,
      to: admin.email,
      subject: `📋 New ${reportType} Submitted — ${project.title} | SQRMT`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:30px 0;">
            <tr><td align="center">
              <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#003366,#0077cc);padding:28px 36px;text-align:center;">
                    <p style="color:#ffd700;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px 0;">Solid State Physics Laboratory · New Delhi · SQRMT</p>
                    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 4px 0;">Quality Format Submitted</h1>
                    <p style="color:#b3d4f0;font-size:12px;margin:0;">SSPL Quality Reliability Monitoring and Tracking</p>
                  </td>
                </tr>

                <!-- Badge -->
                <tr>
                  <td style="background:#e8f0fb;padding:18px;text-align:center;border-bottom:1px solid #d0dff0;">
                    <span style="background:#2a5494;color:#fff;font-size:12px;font-weight:700;padding:6px 18px;border-radius:20px;">📋 ${reportType}</span>
                    <p style="color:#003366;font-size:15px;font-weight:700;margin:10px 0 0 0;">New Submission Received</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:28px 36px;">
                    <p style="color:#333;font-size:15px;margin:0 0 16px 0;">Hello <strong>${admin.name}</strong>,</p>
                    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
                      A project member has submitted a new <strong>${reportType}</strong> entry that requires your review.
                    </p>

                    <!-- Details table -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                      <tr style="background:#f0f4fb;">
                        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#003366;border-bottom:1px solid #e0e8f0;width:40%;">Project</td>
                        <td style="padding:10px 16px;font-size:13px;color:#333;border-bottom:1px solid #e0e8f0;">${project.title}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#003366;border-bottom:1px solid #e0e8f0;background:#f0f4fb;">Submitted By</td>
                        <td style="padding:10px 16px;font-size:13px;color:#333;border-bottom:1px solid #e0e8f0;">${member.name} &lt;${member.email}&gt;</td>
                      </tr>
                      <tr style="background:#f0f4fb;">
                        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#003366;">Report Type</td>
                        <td style="padding:10px 16px;font-size:13px;color:#333;">${reportType}</td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:4px 0 20px 0;">
                          <a href="${viewUrl}" style="background:linear-gradient(135deg,#003366,#0077cc);color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
                            View &amp; Review Report →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#888;font-size:11px;margin:16px 0 0 0;">
                      Or paste this link: <a href="${viewUrl}" style="color:#2a5494;">${viewUrl}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8f9fa;padding:16px 36px;border-top:1px solid #e0e0e0;text-align:center;">
                    <p style="color:#999;font-size:11px;margin:0;">
                      SQRMT · DRDO Solid State Physics Laboratory, New Delhi · Do not reply to this email
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Quality submission email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending quality submission email:', error);
    return false;
  }
};

/**
 * Send Admin-Created Contributor Account Email
 * @param {Object} user        - { name, email }
 * @param {String} password    - plain-text default password
 * @param {Object} project     - { title }
 */
const sendAdminCreatedAccountEmail = async (user, password, project) => {
  try {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    const mailOptions = {
      from: `"SQRMT - DRDO SSPL" <${process.env.EMAIL_FROM || process.env.SMTP_FROM_EMAIL || 'noreply@sspl.drdo.in'}>`,
      to: user.email,
      subject: `🎉 Your SQRMT Account Has Been Created — ${project.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:30px 0;">
            <tr><td align="center">
              <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#003366,#0077cc);padding:28px 36px;text-align:center;">
                    <p style="color:#ffd700;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px 0;">Solid State Physics Laboratory · New Delhi</p>
                    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 4px 0;">Account Created for You</h1>
                    <p style="color:#b3d4f0;font-size:12px;margin:0;">SSPL Quality Reliability Monitoring and Tracking</p>
                  </td>
                </tr>

                <!-- Icon banner -->
                <tr>
                  <td style="background:#e8f0fb;padding:20px;text-align:center;border-bottom:1px solid #d0dff0;">
                    <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:14px;border:2px solid #2a5494;">
                      <span style="font-size:28px;">🎉</span>
                    </div>
                    <p style="color:#003366;font-size:16px;font-weight:700;margin:10px 0 0 0;">Welcome to SQRMT, ${user.name}!</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px 36px;">
                    <p style="color:#333;font-size:15px;margin:0 0 12px 0;">Hello <strong>${user.name}</strong>,</p>
                    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
                      An administrator has created a contributor account for you on <strong>SQRMT</strong>.
                      You have been added to the project <strong>${project.title}</strong> and will receive all project notifications.
                    </p>

                    <!-- Credentials box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                      <tr style="background:#f0f4fb;">
                        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#003366;border-bottom:1px solid #e0e8f0;width:40%;">Email / Username</td>
                        <td style="padding:10px 16px;font-size:13px;color:#333;border-bottom:1px solid #e0e8f0;">${user.email}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#003366;border-bottom:1px solid #e0e8f0;background:#f0f4fb;">Default Password</td>
                        <td style="padding:10px 16px;font-size:15px;color:#003366;font-weight:700;border-bottom:1px solid #e0e8f0;letter-spacing:1px;">${password}</td>
                      </tr>
                      <tr style="background:#f0f4fb;">
                        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#003366;">Project</td>
                        <td style="padding:10px 16px;font-size:13px;color:#333;">${project.title}</td>
                      </tr>
                    </table>

                    <!-- Security warning -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:14px 18px;">
                          <p style="color:#7a5c00;font-size:12px;font-weight:700;margin:0 0 6px 0;">🔒 Security Recommendation:</p>
                          <p style="color:#7a5c00;font-size:12px;margin:0;line-height:1.7;">
                            We strongly recommend changing your password from the default immediately after logging in for the first time, to ensure the security of your account.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:4px 0 20px 0;">
                          <a href="${loginUrl}" style="background:linear-gradient(135deg,#003366,#0077cc);color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
                            Log In to SQRMT →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8f9fa;padding:18px 36px;border-top:1px solid #e0e0e0;text-align:center;">
                    <p style="color:#999;font-size:11px;margin:0;">
                      This is an automated message from SQRMT · DRDO Solid State Physics Laboratory<br/>
                      New Delhi · Do not reply to this email
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin-created account email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending admin-created account email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendProjectPingEmail,
  sendReportSubmissionEmail,
  sendQualitySubmissionEmail,
  sendAdminCreatedAccountEmail,
};
