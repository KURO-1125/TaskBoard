const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide an automation name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  trigger: {
    type: {
      type: String,
      enum: ['status_change', 'assignment', 'due_date', 'comment_added'],
      required: true
    },
    conditions: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  actions: [{
    type: {
      type: String,
      enum: ['assign_badge', 'change_status', 'send_notification', 'assign_user', 'add_comment'],
      required: true
    },
    params: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastTriggered: {
    type: Date
  },
  triggerCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
automationSchema.index({ project: 1 });
automationSchema.index({ isActive: 1 });
automationSchema.index({ 'trigger.type': 1 });

const Automation = mongoose.model('Automation', automationSchema);

module.exports = Automation; 