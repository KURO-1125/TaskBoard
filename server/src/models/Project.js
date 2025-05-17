const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: String,
    required: true,
    ref: 'User'
  },
  members: [{
    user: {
      type: String,
      required: true,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'member'],
      default: 'member'
    }
  }],
  statuses: [{
    name: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Default statuses for new projects
projectSchema.pre('save', function(next) {
  if (this.isNew && (!this.statuses || this.statuses.length === 0)) {
    this.statuses = [
      { name: 'To Do', order: 0 },
      { name: 'In Progress', order: 1 },
      { name: 'Done', order: 2 }
    ];
  }
  next();
});

// Add indexes for faster queries
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 