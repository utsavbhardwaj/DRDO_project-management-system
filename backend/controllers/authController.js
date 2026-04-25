const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/mailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

/**
 * Register User — stores details in PendingRegistration table ONLY.
 * The user is NOT created in the User table until email is verified.
 */
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if a verified user already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any previous pending registration for this email (e.g. re-register)
    await prisma.pendingRegistration.deleteMany({ where: { email } });

    // Store in PendingRegistration — NOT in User table
    await prisma.pendingRegistration.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role: role || 'Member',
        verificationToken,
        expiresAt,
      }
    });

    // Send verification email
    const emailSent = await sendVerificationEmail({ name, email }, verificationToken);

    // Build the verification URL for console fallback
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${verificationToken}`;
    
    // Always log to console so developer can test even if email fails
    console.log('========================================');
    console.log('📧 VERIFICATION EMAIL DETAILS');
    console.log('To:', email);
    console.log('Token:', verificationToken);
    console.log('Verify URL:', verificationUrl);
    console.log('Email sent via SMTP:', emailSent ? '✅ Yes' : '❌ No (check SMTP config)');
    console.log('========================================');

    res.status(201).json({
      needsVerification: true,
      emailSent,
      message: emailSent 
        ? 'Registration successful! Please check your email to verify your account before logging in.'
        : 'Registration successful! Verification email could not be sent — please check server logs for the verification link, or use "Resend Verification".'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Verify Email — moves user from PendingRegistration to User table.
 * This is the ONLY way a user gets created.
 */
const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    // Look up the pending registration
    const pending = await prisma.pendingRegistration.findFirst({ 
      where: { verificationToken: token } 
    });

    if (!pending) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Check if token has expired
    if (new Date() > pending.expiresAt) {
      // Clean up expired record
      await prisma.pendingRegistration.delete({ where: { id: pending.id } });
      return res.status(400).json({ message: 'Verification token has expired. Please register again.' });
    }

    // Check if a user with this email somehow already exists (edge case)
    const existingUser = await prisma.user.findUnique({ where: { email: pending.email } });
    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } });
      return res.status(400).json({ message: 'User already exists. Please log in.' });
    }

    // ✅ NOW create the user in the real User table
    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.password,
        role: pending.role,
        isVerified: true,       // Already verified!
        verificationToken: null, // No need to store token anymore
      }
    });

    // Clean up the pending registration
    await prisma.pendingRegistration.delete({ where: { id: pending.id } });

    console.log(`✅ User verified and created: ${user.email} (${user.id})`);

    res.json({ message: 'Email successfully verified! You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      // All users in User table are verified (by design now), but keep the check for safety
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in.' });
      }

      res.json({
        _id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, token: generateToken(user.id)
      });
    } else {
      // Also check if they have a pending registration
      const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
      if (pending) {
        return res.status(401).json({ 
          message: 'Your account is not yet verified. Please check your email for the verification link, or click "Resend Verification".',
          needsVerification: true
        });
      }
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpiresAt: resetExpires }
    });

    const emailSent = await sendPasswordResetEmail(user, resetToken);

    // Console fallback for testing
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    console.log('========================================');
    console.log('🔐 PASSWORD RESET DETAILS');
    console.log('To:', email);
    console.log('Reset URL:', resetUrl);
    console.log('Email sent via SMTP:', emailSent ? '✅ Yes' : '❌ No');
    console.log('========================================');

    res.json({ message: 'Password reset email sent. Check your inbox (and server console if email is not delivered).' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  try {
    const user = await prisma.user.findFirst({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpiresAt: { gt: new Date() } // not expired
      } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null
      }
    });

    res.json({ message: 'Password has been successfully reset' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    // Check PendingRegistration table (that's where unverified users live now)
    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
    
    if (!pending) {
      // Maybe they're already verified?
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        return res.status(400).json({ message: 'Email is already verified. You can log in.' });
      }
      return res.status(404).json({ message: 'No registration found for this email. Please register first.' });
    }

    // Generate a new token and extend expiry
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 more hours

    await prisma.pendingRegistration.update({
      where: { id: pending.id },
      data: { verificationToken, expiresAt }
    });

    const emailSent = await sendVerificationEmail({ name: pending.name, email: pending.email }, verificationToken);

    // Console fallback
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${verificationToken}`;
    console.log('========================================');
    console.log('📧 RESEND VERIFICATION DETAILS');
    console.log('To:', email);
    console.log('Verify URL:', verificationUrl);
    console.log('Email sent via SMTP:', emailSent ? '✅ Yes' : '❌ No');
    console.log('========================================');

    res.json({ 
      message: emailSent 
        ? 'Verification email has been resent. Please check your inbox and spam folder.'
        : 'Verification email could not be sent. Check the server console for the verification link.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMembers = async (req, res) => {
  try {
    const members = await prisma.user.findMany({ 
      where: { role: 'Member' },
      select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true }
    });
    res.json(members.map(m => ({ ...m, _id: m.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'Member' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        assignedProjects: {
          select: { id: true, title: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users.map(u => ({ ...u, _id: u.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'Admin') return res.status(403).json({ message: 'Cannot delete an admin account' });

    // Remove user from all projects first (many-to-many disconnect)
    await prisma.user.update({
      where: { id },
      data: { assignedProjects: { set: [] } }
    });

    // Delete all related records
    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.submission.deleteMany({ where: { memberId: id } });
    await prisma.document.deleteMany({ where: { uploadedById: id } });
    await prisma.activityLog.updateMany({ where: { userId: id }, data: { userId: null } });

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, getMembers, getAllUsers, deleteUser, verifyEmail, forgotPassword, resetPassword, resendVerification };
