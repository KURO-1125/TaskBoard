import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Dashboard,
  Folder,
  Person
} from '@mui/icons-material';

const Sidebar = () => {
  const location = useLocation();
  const navigation = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <Dashboard className="h-6 w-6" />,
      color: 'bg-blue-600 dark:bg-blue-500'
    },
    { 
      name: 'Projects', 
      path: '/projects', 
      icon: <Folder className="h-6 w-6" />,
      color: 'bg-purple-600 dark:bg-purple-500'
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: <Person className="h-6 w-6" />,
      color: 'bg-green-600 dark:bg-green-500'
    }
  ];

  return (
    <div className="w-64 bg-white dark:bg-black-900 border-r border-black-100 dark:border-black-800 h-screen flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-black-900 dark:text-white">TaskBoard</h2>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? `${item.color} text-white shadow-elevation-1`
                    : 'text-black-600 dark:text-black-300 hover:bg-black-50 dark:hover:bg-black-800 hover:text-black-900 dark:hover:text-white'
                }`
              }
            >
              <div className={`mr-3 ${
                location.pathname === item.path
                  ? 'text-white'
                  : `${item.color} text-white p-1 rounded-md`
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

export default Sidebar; 