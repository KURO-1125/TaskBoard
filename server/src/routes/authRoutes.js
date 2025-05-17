const express = require('express');
const router = express.Router();
const { googleLogin, getCurrentUser, updateProfile } = require('../controllers/auth');
const auth = require('../middleware/auth');

// Public routes
router.post('/google', googleLogin);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);

module.exports = router; 