const Project = require('../models/Project');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Task = require('../models/Task');

// Create new project
exports.createProject = async (req, res) => {
  try {
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
    const { title, description, statuses, owner, members } = req.body;
    
    if (!owner || !members || !members.length || !members[0].user) {
      console.error('Missing required fields:', { owner, members });
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          owner: !owner ? 'Owner is required' : null,
          members: !members || !members.length ? 'Members array is required' : 
                  !members[0].user ? 'First member user ID is required' : null
        }
      });
    }

    // Validate that the owner ID exists in the User collection
    const ownerExists = await User.findById(owner);
    if (!ownerExists) {
      return res.status(400).json({
        message: 'Invalid owner ID',
        details: { owner: 'User not found' }
      });
    }

    // Validate that all member user IDs exist
    for (const member of members) {
      const userExists = await User.findById(member.user);
      if (!userExists) {
        return res.status(400).json({
          message: 'Invalid member ID',
          details: { member: `User with ID ${member.user} not found` }
        });
      }
    }
    
    console.log('Creating project with data:', {
      title,
      description,
      owner,
      members,
      statuses
    });
    
    // Create project with owner and member information
    const project = await Project.create({
      title,
      description,
      owner,
      members,
      statuses: statuses || [
        { name: 'To Do', order: 0 },
        { name: 'In Progress', order: 1 },
        { name: 'Done', order: 2 }
      ]
    });

    console.log('Project created:', JSON.stringify(project.toObject(), null, 2));

    await Activity.create({
      user: req.user.userId,
      project: project._id.toString(),
      type: 'project_created',
      description: `Created project "${project.title}"`
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', {
      name: error.name,
      message: error.message,
      validationErrors: error.errors,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: error.message,
        validationErrors: error.errors 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    console.log('Current userId:', req.user.userId, 'Type:', typeof req.user.userId);

    const allProjects = await Project.find({});
    console.log('All projects:', JSON.stringify(allProjects, null, 2));

    const projects = await Project.find({ 'members.user': req.user.userId.toString() })
    .populate('members.user', 'name email profilePicture');
    console.log('Projects found:', JSON.stringify(projects, null, 2));

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email profilePicture')
      .populate('members.user', 'name email profilePicture');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Correct membership check
    if (!project.members.some(member => member.user === req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { title, description, statuses } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.statuses = statuses || project.statuses;
    await project.save();

    await Activity.create({
      user: req.user.userId,
      project: project._id.toString(),
      type: 'project_updated',
      description: `Updated project "${project.title}"`
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });

    // Delete all activities associated with this project
    await Activity.deleteMany({ project: req.params.id });

    // Delete the project using findByIdAndDelete
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// Invite user to project
exports.inviteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (project.members.some(member => member.user === user._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Check if invitation already exists
    const existingInvite = await Invitation.findOne({ project: project._id.toString(), user: user._id.toString(), status: 'pending' });
    if (existingInvite) {
      return res.status(400).json({ message: 'User already has a pending invitation' });
    }

    // Create invitation
    await Invitation.create({
      project: project._id.toString(),
      user: user._id.toString(),
      role: 'member',
      status: 'pending'
    });

    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};