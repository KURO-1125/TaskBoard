const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Automation = require('../models/Automation');

// Get all tasks for a project
router.get('/projects/:projectId/tasks', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new task
router.post('/projects/:projectId/tasks', auth, async (req, res) => {
  try {
    const { title, description, status, assignedTo, dueDate, priority, tags } = req.body;
    const projectId = req.params.projectId;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      status,
      assignedTo,
      dueDate,
      priority,
      tags,
      createdBy: req.user.userId
    });

    await task.populate('assignedTo', 'name email profilePicture');
    await task.populate('createdBy', 'name email profilePicture');

    // Check for automations
    const automations = await Automation.find({
      project: projectId,
      isActive: true,
      'trigger.type': 'assignment'
    });

    for (const automation of automations) {
      if (automation.trigger.conditions.assignedTo === assignedTo) {
        for (const action of automation.actions) {
          if (action.type === 'change_status') {
            task.status = action.params.status;
            await task.save();
          }
        }
      }
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a task
router.put('/projects/:projectId/tasks/:taskId', auth, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, status, assignedTo, dueDate, priority, tags } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    const oldAssignedTo = task.assignedTo;

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (tags) task.tags = tags;

    await task.save();
    await task.populate('assignedTo', 'name email profilePicture');
    await task.populate('createdBy', 'name email profilePicture');

    // Check for automations
    const automations = await Automation.find({
      project: projectId,
      isActive: true,
      $or: [
        { 'trigger.type': 'status_change' },
        { 'trigger.type': 'assignment' }
      ]
    });

    for (const automation of automations) {
      if (automation.trigger.type === 'status_change' && 
          automation.trigger.conditions.from === oldStatus &&
          automation.trigger.conditions.to === status) {
        for (const action of automation.actions) {
          if (action.type === 'assign_badge') {
            // Implement badge assignment logic
          }
        }
      }
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a task
router.delete('/projects/:projectId/tasks/:taskId', auth, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId, 'members.role': 'admin' }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.findOneAndDelete({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to a task
router.post('/projects/:projectId/tasks/:taskId/comments', auth, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { text } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      user: req.user.userId,
      text
    });

    await task.save();
    await task.populate('comments.user', 'name email profilePicture');

    // Check for comment-based automations
    const automations = await Automation.find({
      project: projectId,
      isActive: true,
      'trigger.type': 'comment_added'
    });

    for (const automation of automations) {
      for (const action of automation.actions) {
        if (action.type === 'send_notification') {
          // Implement notification logic
        }
      }
    }

    res.json(task);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 