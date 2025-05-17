const Automation = require('../models/Automation');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
// Create automation
exports.createAutomation = async (req, res) => {
  try {
    const { name, description, trigger, actions, projectId } = req.body;

    // Check if project exists and user is the owner
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate trigger
    if (!trigger || !trigger.type || !trigger.conditions) {
      return res.status(400).json({ message: 'Invalid trigger configuration' });
    }

    // Validate trigger type and conditions
    switch (trigger.type) {
      case 'status_change':
        if (!trigger.conditions.from || !trigger.conditions.to) {
          return res.status(400).json({ message: 'Status change trigger requires from and to conditions' });
        }
        break;
      case 'assignment':
        if (!trigger.conditions.assignee) {
          return res.status(400).json({ message: 'Assignment trigger requires an assignee condition' });
        }
        break;
      case 'due_date':
        if (!trigger.conditions.daysBefore) {
          return res.status(400).json({ message: 'Due date trigger requires daysBefore condition' });
        }
        break;
      case 'comment_added':
        if (!trigger.conditions.keywords) {
          return res.status(400).json({ message: 'Comment trigger requires keywords condition' });
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid trigger type' });
    }

    // Validate actions
    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({ message: 'At least one action is required' });
    }

    for (const action of actions) {
      if (!action.type || !action.params) {
        return res.status(400).json({ message: 'Invalid action configuration' });
      }

      // Validate action type and parameters
      switch (action.type) {
        case 'change_status':
          if (!action.params.newStatus) {
            return res.status(400).json({ message: 'Change status action requires newStatus parameter' });
          }
          break;
        case 'assign_user':
          if (!action.params.assignee) {
            return res.status(400).json({ message: 'Assign user action requires assignee parameter' });
          }
          break;
        case 'add_comment':
          if (!action.params.comment) {
            return res.status(400).json({ message: 'Add comment action requires comment parameter' });
          }
          break;
        case 'send_notification':
          if (!action.params.message || !action.params.recipients) {
            return res.status(400).json({ message: 'Send notification action requires message and recipients parameters' });
          }
          break;
        default:
          return res.status(400).json({ message: 'Invalid action type' });
      }
    }

    const automation = await Automation.create({
      project: projectId,
      name,
      description,
      trigger,
      actions,
      createdBy: req.user.userId
    });

    await automation.populate('createdBy', 'name email profilePicture');
    res.status(201).json(automation);
  } catch (error) {
    console.error('Create automation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get project automations
exports.getAutomations = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!project.members.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const automations = await Automation.find({ project: projectId });
    res.json(automations);
  } catch (error) {
    console.error('Get automations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update automation
exports.updateAutomation = async (req, res) => {
  try {
    const { trigger, actions } = req.body;
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    // Check if user is the project owner
    const project = await Project.findById(automation.project);
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    automation.trigger = trigger || automation.trigger;
    automation.actions = actions || automation.actions;
    await automation.save();

    res.json(automation);
  } catch (error) {
    console.error('Update automation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete automation
exports.deleteAutomation = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    // Check if user is the project owner
    const project = await Project.findById(automation.project);
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await automation.remove();
    res.json({ message: 'Automation deleted' });
  } catch (error) {
    console.error('Delete automation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Test automation
exports.testAutomation = async (req, res) => {
  try {
    const { trigger, actions } = req.body;
    const projectId = req.params.projectId;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!project.members.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate trigger and actions
    if (!trigger || !actions) {
      return res.status(400).json({ message: 'Invalid automation configuration' });
    }

    // Check trigger type
    if (!['status_change', 'assignment', 'due_date'].includes(trigger.type)) {
      return res.status(400).json({ message: 'Invalid trigger type' });
    }

    // Check action types
    for (const action of actions) {
      if (!['assign_badge', 'change_status', 'send_notification'].includes(action.type)) {
        return res.status(400).json({ message: 'Invalid action type' });
      }
    }

    res.json({ message: 'Automation configuration is valid' });
  } catch (error) {
    console.error('Test automation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 