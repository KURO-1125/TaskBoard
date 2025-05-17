import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Dashboard,
  Folder,
  Person
} from '@mui/icons-material';

const TeamSidebar = () => {
  const location = useLocation();
  const teamNavigation = [
    { 
      name: 'Dashboard', 
      path: '/team', 
      icon: <Dashboard className="h-6 w-6" />
    },
    { 
      name: 'Projects', 
      path: '/team/projects', 
      icon: <Folder className="h-6 w-6" />
    },
    { 
      name: 'Profile', 
      path: '/team/profile', 
      icon: <Person className="h-6 w-6" />
    }
  ];

  return (
    <div className="w-64 bg-white dark:bg-black-900 border-r border-black-100 dark:border-black-800 h-screen flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-black-900 dark:text-white">Team Space</h2>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {teamNavigation.map((item) => (
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
    </div>
  );
};

export default TeamSidebar; 