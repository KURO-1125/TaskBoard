import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { Logout, Mail } from '@mui/icons-material';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white dark:bg-black-900 border-b border-black-100 dark:border-black-800 shadow-elevation-1">
      <div className="flex justify-between h-16 px-4">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-500 hover:to-purple-500 transition-all duration-200">
            TaskBoard Pro
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center space-x-3 text-black-700 dark:text-black-200 hover:text-black-900 dark:hover:text-white transition-colors duration-200"
              >
                <div className="relative">
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="h-8 w-8 rounded-full ring-2 ring-green-500 dark:ring-green-400"
                  />
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-black-900" />
                </div>
                <span className="font-medium">{user.name}</span>
              </Link>
              <Link
                to="/invitations"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200"
              >
                <Mail className="h-5 w-5" />
                <span className="font-medium">Invitations</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-text flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Logout className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 