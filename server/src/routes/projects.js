const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projects');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const taskRoutes = require('./taskRoutes');

// All routes are protected
router.use(auth);
console.log("Project routes Loaded")

// Get all projects for the current user
router.get('/', projectController.getProjects);

// Create a new project
router.post('/', projectController.createProject);

// Get a specific project by ID
router.get('/:id', projectController.getProject);

// Update a project by ID
router.put('/:id', projectController.updateProject);

// Delete a project by ID
router.delete('/:id', projectController.deleteProject);

// Invite a user to a project
router.post('/:id/invite', projectController.inviteUser);

// Task routes (nested under projects)
router.use('/:projectId/tasks', taskRoutes);

module.exports = router; 