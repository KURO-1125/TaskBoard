import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProjects, createProject } from '../store/slices/projectSlice';
import { Add, Folder, People, CalendarMonth } from '@mui/icons-material';

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    statuses: [
      { name: 'To Do', order: 0 },
      { name: 'In Progress', order: 1 },
      { name: 'Done', order: 2 }
    ]
  });
  const [imageError, setImageError] = useState({});

  const handleImageError = (id) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const getProfileImage = (user) => {
    if (!user?.profilePicture || imageError[user._id]) {
      const emojis = ['😊', '🎨', '🚀', '💡', '🎯', '🌟', '💻', '🎮', '🎵', '📚', '🎪', '🎭', '🎪', '🎨', '🎯'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(randomEmoji)}&background=random&color=fff&size=128&font-size=0.5`;
    }
    return user.profilePicture;
  };

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...newProject,
        owner: user.id,
        members: [{ user: user.id, role: 'owner' }]
      };
      
      await dispatch(createProject(projectData)).unwrap();
      setIsModalOpen(false);
      setNewProject({
        title: '',
        description: '',
        statuses: [
          { name: 'To Do', order: 0 },
          { name: 'In Progress', order: 1 },
          { name: 'Done', order: 2 }
        ]
      });
    } catch (error) {
      console.error('Failed to create project:', error);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-black-600 dark:text-black-400">Manage and track your projects</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <Add className="h-5 w-5 mr-2" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white dark:bg-black-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 border border-black-100 dark:border-black-800"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-black-900 dark:text-white mb-2">
                {project.title}
              </h3>
              <p className="text-black-600 dark:text-black-400 mb-4">
                {project.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={getProfileImage(project.owner)}
                    alt={project.owner.name}
                    onError={() => handleImageError(project.owner._id)}
                    className="h-8 w-8 rounded-full ring-2 ring-blue-500 dark:ring-blue-400 object-cover"
                  />
                  <span className="text-sm text-black-600 dark:text-black-400">
                    {project.owner.name}
                  </span>
                </div>
                <Link
                  to={`/projects/${project._id}`}
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  View Project
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="px-6 py-4 bg-black-50 dark:bg-black-800/50 border-t border-black-100 dark:border-black-800">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-black-600 dark:text-black-400">
                  <People className="h-4 w-4 mr-1" />
                  {project.members.length} Members
                </div>
                <div className="flex items-center text-black-600 dark:text-black-400">
                  <CalendarMonth className="h-4 w-4 mr-1" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black-900/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black-900 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-black-900 dark:text-white mb-4">
              Create New Project
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
                >
                  Project Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
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
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-black-200 dark:border-black-700 bg-white dark:bg-black-800 text-black-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects; 