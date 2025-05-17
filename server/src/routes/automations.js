const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Automation = require('../models/Automation');
const Project = require('../models/Project');

// Get all automations for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const automations = await Automation.find({ project: project._id })
      .populate('createdBy', 'name email profilePicture');

    res.json(automations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new automation
router.post('/', auth, async (req, res) => {
  try {
    const { projectId, name, description, trigger, actions } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const automation = await Automation.create({
      project: projectId,
      name,
      description,
      trigger,
      actions,
      createdBy: req.user._id
    });

    await automation.populate('createdBy', 'name email profilePicture');
    res.status(201).json(automation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an automation
router.put('/:id', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const project = await Project.findOne({
      _id: automation.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, trigger, actions, isActive } = req.body;
    if (name) automation.name = name;
    if (description) automation.description = description;
    if (trigger) automation.trigger = trigger;
    if (actions) automation.actions = actions;
    if (typeof isActive === 'boolean') automation.isActive = isActive;

    await automation.save();
    res.json(automation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an automation
router.delete('/:id', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const project = await Project.findOne({
      _id: automation.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await automation.remove();
    res.json({ message: 'Automation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle automation status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const project = await Project.findOne({
      _id: automation.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    automation.isActive = !automation.isActive;
    await automation.save();

    res.json(automation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 