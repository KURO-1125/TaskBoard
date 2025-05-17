import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Assignment, 
  CheckCircle, 
  Schedule, 
  Flag, 
  FilterList,
  Star,
  Category
} from '@mui/icons-material';

const TasksSidebar = () => {
  const taskNavigation = [
    { 
      name: 'All Tasks', 
      path: '/tasks', 
      icon: <Assignment className="h-6 w-6" />
    },
    { 
      name: 'Completed', 
      path: '/tasks/completed', 
      icon: <CheckCircle className="h-6 w-6" />
    },
    { 
      name: 'Upcoming', 
      path: '/tasks/upcoming', 
      icon: <Schedule className="h-6 w-6" />
    },
    { 
      name: 'Priority', 
      path: '/tasks/priority', 
      icon: <Flag className="h-6 w-6" />
    },
    { 
      name: 'Categories', 
      path: '/tasks/categories', 
      icon: <Category className="h-6 w-6" />
    },
    { 
      name: 'Favorites', 
      path: '/tasks/favorites', 
      icon: <Star className="h-6 w-6" />
    },
    { 
      name: 'Filters', 
      path: '/tasks/filters', 
      icon: <FilterList className="h-6 w-6" />
    }
  ];

  return (
    <div className="w-64 bg-white dark:bg-black-900 border-r border-black-100 dark:border-black-800 h-screen flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-black-900 dark:text-white">Task Management</h2>
          <p className="text-sm text-black-600 dark:text-black-400">Organize your work</p>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {taskNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-black-900 dark:bg-white text-white dark:text-black-900 shadow-elevation-1'
                    : 'text-black-600 dark:text-black-300 hover:bg-black-50 dark:hover:bg-black-800 hover:text-black-900 dark:hover:text-white'
                }`
              }
            >
              <div className={`mr-3 ${
                location.pathname === item.path
                  ? 'text-white dark:text-black-900'
                  : 'text-black-400 dark:text-black-500 group-hover:text-black-600 dark:group-hover:text-black-300'
              }`}>
                {item.icon}
              </div>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-black-100 dark:border-black-800">
        <div className="bg-black-50 dark:bg-black-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-black-900 dark:text-white mb-2">Task Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-black-600 dark:text-black-300 mb-1">
                <span>Today's Tasks</span>
                <span>3/5</span>
              </div>
              <div className="h-2 bg-black-200 dark:bg-black-700 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-black-900 dark:bg-white"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-black-600 dark:text-black-300 mb-1">
                <span>This Week</span>
                <span>12/20</span>
              </div>
              <div className="h-2 bg-black-200 dark:bg-black-700 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-black-900 dark:bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksSidebar; 