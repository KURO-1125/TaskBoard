import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchItems } from '../../store/slices/searchSlice';

const SearchBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { results, loading } = useSelector((state) => state.search);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (query.length >= 2) {
      dispatch(searchItems({ query, category: selectedCategory }));
    }
  }, [query, selectedCategory, dispatch]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    switch (item.type) {
      case 'project':
        navigate(`/projects/${item._id}`);
        break;
      case 'task':
        navigate(`/projects/${item.project}/tasks/${item._id}`);
        break;
      case 'user':
        navigate(`/profile/${item._id}`);
        break;
      default:
        break;
    }
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'projects', name: 'Projects' },
    { id: 'tasks', name: 'Tasks' },
    { id: 'users', name: 'Users' }
  ];

  const getItemIcon = (type) => {
    switch (type) {
      case 'project':
        return (
          <svg
            className="h-5 w-5 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        );
      case 'task':
        return (
          <svg
            className="h-5 w-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case 'user':
        return (
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search projects, tasks, or users..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No results found
              </div>
            ) : (
              <div className="py-2">
                {results.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelect(item)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {getItemIcon(item.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.title || item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          {item.project && ` in ${item.project.title}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 