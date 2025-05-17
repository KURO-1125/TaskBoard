import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import axiosInstance from '../utils/axios';
import { Edit, History, Email } from '@mui/icons-material';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    profilePicture: user?.profilePicture || ''
  });
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axiosInstance.get('/activities/user');
        setActivities(res.data);
      } catch (error) {
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={user?.profilePicture}
              alt={user?.name}
              className="h-24 w-24 rounded-full ring-4 ring-white/20"
            />
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-black-50 transition-colors duration-200"
              >
                <Edit className="h-5 w-5 text-blue-600" />
              </button>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Email className="h-4 w-4 text-blue-100" />
              <p className="text-blue-100">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="bg-white dark:bg-black-900 rounded-xl p-6 shadow-lg border border-black-100 dark:border-black-800">
          <h2 className="text-lg font-semibold text-black-900 dark:text-white mb-4">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label
                htmlFor="profilePicture"
                className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
              >
                Profile Picture URL
              </label>
              <input
                type="url"
                id="profilePicture"
                value={formData.profilePicture}
                onChange={(e) =>
                  setFormData({ ...formData, profilePicture: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-black-700 dark:text-black-300 hover:text-black-900 dark:hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activity Section */}
      <div className="bg-white dark:bg-black-900 rounded-xl p-6 shadow-lg border border-black-100 dark:border-black-800">
        <div className="flex items-center space-x-2 mb-4">
          <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-black-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {loadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-black-600 dark:text-black-400">
              No recent activity.
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map(activity => (
                <div
                  key={activity._id}
                  className="flex items-start space-x-4 p-4 bg-black-50 dark:bg-black-800/50 rounded-lg hover:bg-black-100 dark:hover:bg-black-800 transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {activity.type[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-black-900 dark:text-white">
                      {activity.description}
                    </p>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-black-600 dark:text-black-400">
                      {activity.project?.title && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-black-100 dark:bg-black-800">
                          {activity.project.title}
                        </span>
                      )}
                      <span>{new Date(activity.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 