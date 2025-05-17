import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { fetchTasks } from '../store/slices/taskSlice';
import { Assignment, CheckCircle, CalendarMonth, Person, Flag } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const Tasks = () => {
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { tasksByProject, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const response = await axiosInstance.get('/tasks');
        // Transform the response to match our tasksByProject structure
        const tasksByProject = response.data.reduce((acc, task) => {
          if (!acc[task.project]) {
            acc[task.project] = [];
          }
          acc[task.project].push(task);
          return acc;
        }, {});
        dispatch({ type: 'tasks/fetchTasks/fulfilled', payload: { tasksByProject } });
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchAllTasks();
  }, [dispatch]);

  const filter = state?.filter || 'all';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all tasks from all projects
  const allTasks = Object.values(tasksByProject).flat();

  const filteredTasks = allTasks.filter(task => {
    if (filter === 'completed') {
      return task.status === 'Done';
    }
    if (filter === 'due-today') {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && task.status !== 'Done';
    }
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getHeaderText = () => {
    switch (filter) {
      case 'completed':
        return 'Completed Tasks';
      case 'due-today':
        return 'Tasks Due Today';
      default:
        return 'All Tasks';
    }
  };

  const getEmptyStateText = () => {
    switch (filter) {
      case 'completed':
        return 'No completed tasks';
      case 'due-today':
        return 'No tasks due today';
      default:
        return 'No tasks found';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">
          {getHeaderText()}
        </h1>
        <p className="mt-1 text-blue-100">
          {filter === 'completed' 
            ? 'View all your completed tasks'
            : filter === 'due-today'
            ? 'View tasks that are due today'
            : 'View and manage all your tasks'}
        </p>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-black-600 dark:text-black-400">
              {getEmptyStateText()}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Link
              key={task._id}
              to={`/projects/${task.project}/tasks/${task._id}`}
              className="block p-4 bg-black-50 dark:bg-black-800/50 rounded-lg hover:bg-black-100 dark:hover:bg-black-800 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-black-900 dark:text-white">{task.title}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'Done'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : task.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {task.status}
                    </span>
                    {task.priority && (
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getPriorityColor(task.priority)}`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center text-sm text-black-600 dark:text-black-400">
                        <CalendarMonth className="h-4 w-4 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {task.assignedTo && (
                      <div className="flex items-center text-sm text-black-600 dark:text-black-400">
                        <Person className="h-4 w-4 mr-1" />
                        {task.assignedTo.name}
                      </div>
                    )}
                  </div>
                </div>
                <svg className="h-5 w-5 text-black-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks; 