import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProjects } from '../store/slices/projectSlice';
import { fetchTasks } from '../store/slices/taskSlice';
import { Dashboard as DashboardIcon, Assignment, CheckCircle } from '@mui/icons-material';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { tasksByProject, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        if (project._id) {
          dispatch(fetchTasks(project._id));
        }
      });
    }
  }, [dispatch, projects]);

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeProjects = projects.filter((project) => {
    const member = project.members.find((m) => m.user._id === user.id);
    return member && member.role !== 'left';
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all tasks from all projects
  const allTasks = Object.values(tasksByProject).flat();

  // Sort tasks by creation date (newest first)
  const sortedTasks = [...allTasks].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const tasksDueToday = allTasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime() && task.status !== 'Done';
  });

  const completedTasks = allTasks.filter((task) => task.status === 'Done');

  const handleCompletedTasksClick = () => {
    navigate('/tasks', { state: { filter: 'completed' } });
  };

  const handleTasksDueTodayClick = () => {
    navigate('/tasks', { state: { filter: 'due-today' } });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Welcome back, {user.name}! 👋</h1>
        <p className="mt-1 text-blue-100">Here's what's happening with your projects today.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-black-900 rounded-xl p-6 shadow-lg border border-black-100 dark:border-black-800 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black-600 dark:text-black-400">Active Projects</p>
              <p className="text-2xl font-bold text-black-900 dark:text-white mt-1">{activeProjects.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DashboardIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-4 transition-colors duration-200"
          >
            View all projects
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div 
          className="bg-white dark:bg-black-900 rounded-xl p-6 shadow-lg border border-black-100 dark:border-black-800 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
          onClick={handleTasksDueTodayClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black-600 dark:text-black-400">Tasks Due Today</p>
              <p className="text-2xl font-bold text-black-900 dark:text-white mt-1">{tasksDueToday.length}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Assignment className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mt-4 transition-colors duration-200">
            View tasks due today
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-black-900 rounded-xl p-6 shadow-lg border border-black-100 dark:border-black-800 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
          onClick={handleCompletedTasksClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black-600 dark:text-black-400">Completed Tasks</p>
              <p className="text-2xl font-bold text-black-900 dark:text-white mt-1">{completedTasks.length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="inline-flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mt-4 transition-colors duration-200">
            View completed tasks
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="text-lg font-semibold text-black-900 dark:text-white mb-4">Recent Projects</h2>
        <div className="space-y-4">
          {activeProjects.slice(0, 3).map((project) => {
            const projectTasks = tasksByProject[project._id] || [];
            return (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="block p-4 bg-black-50 dark:bg-black-800/50 rounded-lg hover:bg-black-100 dark:hover:bg-black-800 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-black-900 dark:text-white">{project.title}</h3>
                    <p className="text-sm text-black-600 dark:text-black-400 mt-1">
                      {projectTasks.length} tasks
                    </p>
                  </div>
                  <svg className="h-5 w-5 text-black-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white dark:bg-black-900 rounded-xl p-6 shadow-lg border border-black-100 dark:border-black-800">
        <h2 className="text-lg font-semibold text-black-900 dark:text-white mb-4">Recent Tasks</h2>
        <div className="space-y-4">
          {sortedTasks.slice(0, 3).map((task) => (
            <Link
              key={task._id}
              to={`/projects/${task.project}/tasks/${task._id}`}
              className="block p-4 bg-black-50 dark:bg-black-800/50 rounded-lg hover:bg-black-100 dark:hover:bg-black-800 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-black-900 dark:text-white">{task.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'Done'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : task.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {task.status}
                    </span>
                    {task.dueDate && (
                      <span className="text-sm text-black-600 dark:text-black-400">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.assignedTo && (
                      <span className="text-sm text-black-600 dark:text-black-400">
                        • Assigned to {task.assignedTo.name}
                      </span>
                    )}
                  </div>
                </div>
                <svg className="h-5 w-5 text-black-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
          {sortedTasks.length === 0 && (
            <div className="text-center py-4">
              <p className="text-black-600 dark:text-black-400">No tasks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 