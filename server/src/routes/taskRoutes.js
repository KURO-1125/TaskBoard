const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// All routes are protected and nested under /projects/:projectId/tasks
router.use(auth);

// Get all tasks for a project
router.get('/', taskController.getTasks);

// Create a new task
router.post('/', taskController.createTask);

// Get a specific task
router.get('/:taskId', taskController.getTask);

// Update a task
router.put('/:taskId', taskController.updateTask);

// Delete a task
router.delete('/:taskId', taskController.deleteTask);

// Add a comment to a task
router.post('/:taskId/comments', taskController.addComment);

module.exports = router; 