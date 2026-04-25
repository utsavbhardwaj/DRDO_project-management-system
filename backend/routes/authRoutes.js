const express = require('express');
const router = express.Router();
const { registerUser, authUser, getMembers, getAllUsers, deleteUser, verifyEmail, forgotPassword, resetPassword, resendVerification } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/members', protect, admin, getMembers);
router.get('/all-users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);

router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerification);

module.exports = router;


