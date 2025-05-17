const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  badges: [{
    type: String
  }],
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 