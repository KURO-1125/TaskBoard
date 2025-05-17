import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, addComment, fetchTasks } from '../store/slices/taskSlice';
import { fetchProjects } from '../store/slices/projectSlice';
import { Edit, Save, Cancel, CalendarMonth, Person, Comment, Flag } from '@mui/icons-material';

const TaskDetails = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tasksByProject } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState('');
  const [editedTask, setEditedTask] = useState({
    title: '',
    description: '',
    status: '',
    assignedTo: '',
    dueDate: '',
    priority: ''
  });
  const [imageError, setImageError] = useState({});

  // Get tasks for the current project
  const projectTasks = tasksByProject[projectId] || [];
  const task = projectTasks.find((t) => t._id === taskId);
  const project = projects.find((p) => p._id === projectId);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description,
        status: task.status,
        assignedTo: task.assignedTo?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority || 'medium'
      });
    }
  }, [task]);

  if (!task || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await dispatch(
        addComment({
          projectId,
          taskId: task._id,
          text: comment,
        })
      ).unwrap();
      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEdit = () => {
    setEditedTask({
      title: task.title,
      description: task.description,
      status: task.status,
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'medium'
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const taskData = {
        ...editedTask,
        dueDate: editedTask.dueDate ? new Date(editedTask.dueDate).toISOString() : null
      };

      // If the task is being assigned to someone, ensure status is set to "In Progress"
      if (taskData.assignedTo && !task.assignedTo) {
        taskData.status = 'In Progress';
      }

      await dispatch(updateTask({ 
        projectId,
        taskId: task._id, 
        taskData 
      })).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleImageError = (id) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const getProfileImage = (user) => {
    if (!user?.profilePicture || imageError[user._id]) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '🧑🏻')}&background=random`;
    }
    return user.profilePicture;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Task Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Task title"
              />
            ) : (
              <h1 className="text-2xl font-bold">{task.title}</h1>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <Save className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <Cancel className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task Information */}
      <div className="bg-white dark:bg-black-900 rounded-xl p-6 shadow-lg border border-black-100 dark:border-black-800">
        <div className="space-y-4">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-black-900 dark:text-white mb-2">Description</h2>
            {isEditing ? (
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full bg-black-50 dark:bg-black-800 border border-black-200 dark:border-black-700 rounded-lg px-4 py-2 text-black-900 dark:text-white placeholder-black-400 dark:placeholder-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-black-600 dark:text-black-400">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Status, Due Date, and Assignee */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div className="bg-black-50 dark:bg-black-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-black-600 dark:text-black-400 mb-2">Status</h3>
              {isEditing ? (
                <select
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                  className="w-full bg-white dark:bg-black-900 border border-black-200 dark:border-black-700 rounded-lg px-3 py-2 text-black-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {project.statuses.map((status) => (
                    <option key={status.name} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`px-2 py-1 text-sm rounded-full ${
                  task.status === 'Done'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : task.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {task.status}
                </span>
              )}
            </div>

            {/* Priority */}
            <div className="bg-black-50 dark:bg-black-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-black-600 dark:text-black-400 mb-2">Priority</h3>
              {isEditing ? (
                <select
                  value={editedTask.priority}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                  className="w-full bg-white dark:bg-black-900 border border-black-200 dark:border-black-700 rounded-lg px-3 py-2 text-black-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <span className={`px-2 py-1 text-sm rounded-full flex items-center ${
                  task.priority === 'high'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  <Flag className="h-4 w-4 mr-1" />
                  {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                </span>
              )}
            </div>

            {/* Due Date */}
            <div className="bg-black-50 dark:bg-black-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-black-600 dark:text-black-400 mb-2">Due Date</h3>
              {isEditing ? (
                <input
                  type="date"
                  value={editedTask.dueDate}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                  className="w-full bg-white dark:bg-black-900 border border-black-200 dark:border-black-700 rounded-lg px-3 py-2 text-black-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center text-black-900 dark:text-white">
                  <CalendarMonth className="h-5 w-5 mr-2 text-black-400" />
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date set'}
                </div>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="bg-black-50 dark:bg-black-800/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-black-600 dark:text-black-400 mb-2">Assigned To</h3>
            {isEditing ? (
              <select
                value={editedTask.assignedTo}
                onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
                className="w-full bg-white dark:bg-black-900 border border-black-200 dark:border-black-700 rounded-lg px-3 py-2 text-black-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {project.members.map((member) => (
                  <option key={member.user._id} value={member.user._id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center">
                {task.assignedTo ? (
                  <>
                    <img
                      src={getProfileImage(task.assignedTo)}
                      alt={task.assignedTo.name}
                      className="h-8 w-8 rounded-full ring-2 ring-blue-500 dark:ring-blue-400"
                    />
                    <span className="ml-2 font-medium text-black-900 dark:text-white">
                      {task.assignedTo.name}
                    </span>
                  </>
                ) : (
                  <span className="text-black-600 dark:text-black-400">Unassigned</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-black-900 rounded-xl p-6 shadow-lg border border-black-100 dark:border-black-800">
        <div className="flex items-center space-x-2 mb-4">
          <Comment className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-black-900 dark:text-white">Comments</h2>
        </div>
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Comment className="h-5 w-5 mr-2" />
              Add Comment
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {task.comments?.map((comment) => (
            <div key={comment._id} className="bg-black-50 dark:bg-black-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src={getProfileImage(comment.user)}
                  alt={comment.user.name}
                  className="h-6 w-6 rounded-full"
                />
                <span className="font-medium text-black-900 dark:text-white">
                  {comment.user.name}
                </span>
                <span className="text-sm text-black-600 dark:text-black-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-black-600 dark:text-black-400">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails; 