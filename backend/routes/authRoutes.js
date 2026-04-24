const express = require('express');
const router = express.Router();
const { registerUser, authUser, getMembers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/members', protect, admin, getMembers);

module.exports = router;
