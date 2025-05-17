const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const projectController = require('../controllers/projectController');
const taskRoutes = require('./taskRoutes');

// All routes are protected
router.use(auth);

// Project routes
router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/invite', projectController.inviteUser);

// Task routes (nested under projects)
router.use('/:projectId/tasks', taskRoutes);

module.exports = router; 