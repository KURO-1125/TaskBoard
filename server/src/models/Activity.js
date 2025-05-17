const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'project_created',
        'task_created',
        'task_updated',
        'task_deleted',
        'comment_added',
        'joined_project',
        'task_status_updated',
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema); 