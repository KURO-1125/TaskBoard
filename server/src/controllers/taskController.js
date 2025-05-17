const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const Automation = require('../models/Automation');

// Get all tasks for a project
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verify project exists and user has access
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

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, assignedTo, dueDate, priority, tags } = req.body;

    // Verify project exists and user has access
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

    // Create task data object, only including assignedTo if it's not empty
    const taskData = {
      title,
      description,
      project: projectId,
      status,
      dueDate,
      priority,
      tags,
      createdBy: req.user.userId
    };

    // Only add assignedTo if it's not empty
    if (assignedTo && assignedTo.trim() !== '') {
      taskData.assignedTo = assignedTo;
    }

    const task = await Task.create(taskData);

    await task.populate('assignedTo', 'name email profilePicture');
    await task.populate('createdBy', 'name email profilePicture');

    // Check for automations
    const automations = await Automation.find({
      project: projectId,
      isActive: true,
      $or: [
        { 'trigger.type': 'assignment' },
        { 'trigger.type': 'status_change' }
      ]
    });

    for (const automation of automations) {
      let shouldTrigger = false;

      // Check assignment trigger
      if (automation.trigger.type === 'assignment' && 
          automation.trigger.conditions.assignee === assignedTo) {
        shouldTrigger = true;
      }

      // Check status change trigger
      if (automation.trigger.type === 'status_change' && 
          automation.trigger.conditions.from === null && 
          automation.trigger.conditions.to === status) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        // Execute automation actions
        for (const action of automation.actions) {
          switch (action.type) {
            case 'change_status':
              task.status = action.params.newStatus;
              await task.save();
              break;
            case 'assign_user':
              task.assignedTo = action.params.assignee;
              await task.save();
              break;
            case 'add_comment':
              task.comments.push({
                user: req.user.userId,
                text: action.params.comment
              });
              await task.save();
              break;
            case 'send_notification':
              // Implement notification logic here
              break;
          }
        }

        // Update automation stats
        automation.lastTriggered = new Date();
        automation.triggerCount += 1;
        await automation.save();
      }
    }

    // Create activity log
    await Activity.create({
      user: req.user.userId,
      project: projectId,
      type: 'task_created',
      description: `Created task "${task.title}"`
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific task
exports.getTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Verify project exists and user has access
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

    const task = await Task.findOne({ _id: taskId, project: projectId })
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name email profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name email profilePicture'
        }
      });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, dueDate, priority } = req.body;
    const projectId = req.params.projectId;
    const taskId = req.params.taskId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member of the project
    const member = project.members.find(m => m.user.toString() === req.user.userId);
    if (!member) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const currentTask = await Task.findById(taskId);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task is being assigned to someone
    const isBeingAssigned = !currentTask.assignedTo && assignedTo;
    const isStatusChanging = currentTask.status !== status;
    const isAssigneeChanging = currentTask.assignedTo?.toString() !== assignedTo;

    // Prepare update data
    const updateData = {
      title: title || currentTask.title,
      description: description || currentTask.description,
      status: isBeingAssigned ? 'In Progress' : (status || currentTask.status),
      assignedTo: assignedTo || currentTask.assignedTo,
      dueDate: dueDate || currentTask.dueDate,
      priority: priority || currentTask.priority
    };

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true }
    ).populate('assignedTo', 'name email profilePicture');

    // Handle automations
    if (isBeingAssigned || isStatusChanging || isAssigneeChanging) {
      // Get project automations
      const automations = await Automation.find({ 
        project: projectId,
        isActive: true 
      });
      
      for (const automation of automations) {
        // Check if automation should be triggered
        const shouldTrigger = (
          (automation.trigger === 'task_assigned' && isBeingAssigned) ||
          (automation.trigger === 'status_changed' && isStatusChanging) ||
          (automation.trigger === 'assignee_changed' && isAssigneeChanging)
        );

        if (shouldTrigger) {
          // Execute automation action
          switch (automation.action) {
            case 'add_comment':
              await Task.findByIdAndUpdate(taskId, {
                $push: {
                  comments: {
                    text: automation.actionData.comment,
                    user: req.user.userId
                  }
                }
              });
              break;
            case 'change_status':
              await Task.findByIdAndUpdate(taskId, {
                $set: { status: automation.actionData.status }
              });
              break;
            case 'assign_user':
              await Task.findByIdAndUpdate(taskId, {
                $set: { assignedTo: automation.actionData.userId }
              });
              break;
          }

          // Update automation stats
          automation.lastTriggered = new Date();
          automation.triggerCount = (automation.triggerCount || 0) + 1;
          await automation.save();
        }
      }
    }

    // Log the activity
    await Activity.create({
      user: req.user.userId,
      project: projectId,
      type: 'task_updated',
      description: `Updated task "${updatedTask.title}"`,
      task: taskId
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Verify project exists and user has access
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

    const task = await Task.findOneAndDelete({ _id: taskId, project: projectId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Log activity
    await Activity.create({
      user: req.user.userId,
      project: projectId,
      type: 'task_deleted',
      description: `Deleted task "${task.title}"`
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a comment to a task
exports.addComment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { text } = req.body;

    // Verify project exists and user has access
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
      text,
      user: req.user.userId
    });

    await task.save();

    await task.populate('assignedTo', 'name email profilePicture');
    await task.populate('createdBy', 'name email profilePicture');
    await task.populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'name email profilePicture'
      }
    });

    // Log activity
    await Activity.create({
      user: req.user.userId,
      project: projectId,
      type: 'comment_added',
      description: `Commented on task "${task.title}"`
    });

    res.json(task);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 