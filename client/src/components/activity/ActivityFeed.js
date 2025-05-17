import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchActivity } from '../../store/slices/activitySlice';

const ActivityFeed = ({ projectId, userId }) => {
  const dispatch = useDispatch();
  const { activities, loading } = useSelector((state) => state.activity);

  useEffect(() => {
    dispatch(fetchActivity({ projectId, userId }));
  }, [dispatch, projectId, userId]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project_created':
        return (
          <svg
            className="h-6 w-6 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );
      case 'task_created':
        return (
          <svg
            className="h-6 w-6 text-green-600"
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
      case 'task_updated':
        return (
          <svg
            className="h-6 w-6 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );
      case 'comment_added':
        return (
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        );
      case 'user_joined':
        return (
          <svg
            className="h-6 w-6 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'project_created':
        return (
          <>
            created project{' '}
            <Link
              to={`/projects/${activity.project._id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {activity.project.title}
            </Link>
          </>
        );
      case 'task_created':
        return (
          <>
            created task{' '}
            <Link
              to={`/projects/${activity.project._id}/tasks/${activity.task._id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {activity.task.title}
            </Link>{' '}
            in{' '}
            <Link
              to={`/projects/${activity.project._id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {activity.project.title}
            </Link>
          </>
        );
      case 'task_updated':
        return (
          <>
            updated task{' '}
            <Link
              to={`/projects/${activity.project._id}/tasks/${activity.task._id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {activity.task.title}
            </Link>{' '}
            in{' '}
            <Link
              to={`/projects/${activity.project._id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {activity.project.title}
            </Link>
          </>
        );
      case 'comment_added':
        return (
          <>
            commented on task{' '}
            <Link
              to={`/projects/${activity.project._id}/tasks/${activity.task._id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {activity.task.title}
            </Link>{' '}
            in{' '}
            <Link
              to={`/projects/${activity.project._id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {activity.project.title}
            </Link>
          </>
        );
      case 'user_joined':
        return (
          <>
            joined project{' '}
            <Link
              to={`/projects/${activity.project._id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {activity.project.title}
            </Link>
          </>
        );
      default:
        return activity.description;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity._id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      <Link
                        to={`/profile/${activity.user._id}`}
                        className="font-medium text-gray-900"
                      >
                        {activity.user.name}
                      </Link>{' '}
                      {getActivityMessage(activity)}
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={activity.createdAt}>
                      {new Date(activity.createdAt).toLocaleString()}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed; 