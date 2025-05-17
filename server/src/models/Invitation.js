const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  project: { type: String, required: true, ref: 'Project' },
  user: { type: String, required: true, ref: 'User' },
  role: { type: String, default: 'member' },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invitation', invitationSchema); 