const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activityController');
const auth = require('../middleware/auth');

// Get activities (filtered by project or user)
router.get('/user', auth, getActivities);

module.exports = router; 