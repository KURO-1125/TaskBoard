import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/slices/taskSlice';
import { fetchProjects, deleteProject } from '../store/slices/projectSlice';
import axiosInstance from '../utils/axios';
import { Add, Person, CalendarMonth, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';

const ProjectDetails = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { tasksByProject, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium'
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState(null);
  const [imageError, setImageError] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  console.log('Project ID from URL:', projectId);
  console.log('All projects:', projects);
  
  // First, fetch projects
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Then, fetch tasks only when projectId is available and valid
  useEffect(() => {
    if (projectId && projectId !== 'undefined') {
      dispatch(fetchTasks(projectId));
    } else if (projectId === 'undefined') {
      navigate('/dashboard');
    }
  }, [dispatch, projectId, navigate]);

  // Show loading state while projects are being fetched
  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Find the project only after projects are loaded
  const project = projects.find((p) => p._id === projectId);

  // Show project not found only after projects are loaded
  if (!projectsLoading && !project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-black-900 dark:text-white">Project not found</h2>
        <p className="mt-2 text-black-600 dark:text-black-400">The project you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Show loading state while tasks are being fetched
  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
  
    const { source, destination, draggableId } = result;
    
    // Validate that we have all required data
    if (!draggableId || !projectId) {
      console.error('Missing required data for drag operation:', { draggableId, projectId });
      return;
    }
  
    const tasks = tasksByProject[projectId] || [];
    const task = tasks.find((t) => t._id === draggableId);
    
    if (!task) {
      console.error('Task not found for draggableId:', draggableId);
      return;
    }
  
    const updatedTask = {
      ...task,
      status: destination.droppableId
    };
  
    try {
      await dispatch(updateTask({ 
        projectId, 
        taskId: draggableId, 
        taskData: updatedTask 
      })).unwrap();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
        // Only include assignedTo if it's not empty
        ...(newTask.assignedTo ? { assignedTo: newTask.assignedTo } : {})
      };
      await dispatch(createTask({ projectId, taskData })).unwrap();
      setIsModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        status: 'To Do',
        assignedTo: '',
        dueDate: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteStatus(null);
    try {
      await axiosInstance.post(`/projects/${projectId}/invite`, { email: inviteEmail });
      setInviteStatus({ success: true, message: 'User invited successfully!' });
      setInviteEmail('');
    } catch (error) {
      setInviteStatus({ success: false, message: error.response?.data?.message || 'Failed to invite user.' });
    }
  };

  // Sort statuses by order
  const sortedStatuses = [...project.statuses].sort((a, b) => a.order - b.order);

  const handleImageError = (id) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const getProfileImage = (user) => {
    if (!user?.profilePicture || imageError[user._id]) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '🧑🏻')}&background=random`;
    }
    return user.profilePicture;
  };

  const tasks = tasksByProject[projectId] || [];

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await dispatch(deleteProject(projectId)).unwrap();
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await dispatch(deleteTask({ projectId, taskId })).unwrap();
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error(error.message || 'Failed to delete task');
      }
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="mt-1 text-blue-100">{project.description}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
          >
            <Add className="h-5 w-5 mr-2" />
            Add Task
          </button>
          <button
            onClick={handleDeleteProject}
            disabled={isDeleting}
            className={`p-2 ${isDeleting ? 'bg-red-500/20' : 'bg-red-500/10 hover:bg-red-500/20'} rounded-lg transition-colors duration-200`}
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
            ) : (
              <Delete className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Task Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedStatuses.map((status) => (
            <div key={status._id} className="bg-black-50 dark:bg-black-800/50 rounded-xl p-4 border border-black-100 dark:border-black-700">
              <h3 className="text-lg font-semibold text-black-900 dark:text-white mb-4">
                {status.name}
              </h3>
              <Droppable droppableId={status.name}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4 min-h-[200px]"
                  >
                    {tasks
                      .filter((task) => task.status === status.name)
                      .map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleTaskClick(task._id)}
                              className={`bg-white dark:bg-black-900 shadow-lg rounded-lg p-4 border border-black-100 dark:border-black-800 hover:shadow-xl transition-all duration-200 cursor-pointer ${
                                snapshot.isDragging ? 'shadow-2xl' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-black-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                                    {task.title}
                                  </h4>
                                  <p className="mt-1 text-sm text-black-600 dark:text-black-400 line-clamp-2">
                                    {task.description}
                                  </p>
                                  <div className="mt-2 space-y-2">
                                    {task.dueDate && (
                                      <div className="flex items-center text-sm text-black-600 dark:text-black-400">
                                        <CalendarMonth className="h-4 w-4 mr-1" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </div>
                                    )}
                                    {task.assignedTo && (
                                      <div className="flex items-center">
                                        <img
                                          src={getProfileImage(task.assignedTo)}
                                          alt={task.assignedTo.name}
                                          onError={() => handleImageError(task.assignedTo._id)}
                                          className="h-6 w-6 rounded-full ring-2 ring-blue-500 dark:ring-blue-400 object-cover"
                                        />
                                        <span className="ml-2 text-sm text-black-600 dark:text-black-400">
                                          {task.assignedTo.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task._id);
                                  }}
                                  className="p-1 text-red-500 hover:text-red-600 transition-colors duration-200"
                                  title="Delete task"
                                >
                                  <Delete className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Invite User Section */}
      <div className="bg-white dark:bg-black-900 rounded-xl p-6 shadow-lg border border-black-100 dark:border-black-800">
        <h2 className="text-lg font-semibold text-black-900 dark:text-white mb-4">Invite User</h2>
        <form onSubmit={handleInvite} className="flex items-center space-x-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter user email"
            className="flex-1 px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Invite
          </button>
        </form>
        {inviteStatus && (
          <div className={`mt-2 text-sm ${inviteStatus.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {inviteStatus.message}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black-900/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black-900 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-black-900 dark:text-white mb-4">
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
                >
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  required
                >
                  <option value="">Select Status</option>
                  {sortedStatuses.map((status) => (
                    <option key={status._id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="assignedTo"
                  className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
                >
                  Assign To
                </label>
                <select
                  id="assignedTo"
                  value={newTask.assignedTo}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assignedTo: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {project.members.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-black-700 dark:text-black-300 hover:text-black-900 dark:hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails; 