const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const invitationController = require('../controllers/invitations');

// All routes are protected
router.use(auth);

// Get all pending invitations for the current user
router.get('/', invitationController.getInvitations);

// Accept an invitation
router.post('/:id/accept', invitationController.acceptInvitation);

// Decline an invitation
router.post('/:id/decline', invitationController.declineInvitation);

module.exports = router; 