import React, { useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CircularProgress, ThemeProvider, createTheme } from '@mui/material';
import { CssBaseline } from '@mui/material';


// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Projects = React.lazy(() => import('./pages/Projects'));
const ProjectDetails = React.lazy(() => import('./pages/ProjectDetails'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Invitations = React.lazy(() => import('./pages/Invitation'));
const TaskDetails = React.lazy(() => import('./pages/TaskDetails'));
const Tasks = React.lazy(() => import('./pages/Tasks'));

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check for existing session on app load
    dispatch(getCurrentUser());
    
    // Add dark mode class to body if user prefers dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, [dispatch]);

  const theme = createTheme({
    palette: {
      mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      primary: {
        main: '#000000',
        light: '#404040',
        dark: '#000000',
      },
      secondary: {
        main: '#262626',
        light: '#404040',
        dark: '#171717',
      },
      background: {
        default: document.documentElement.classList.contains('dark') ? '#0a0a0a' : '#fafafa',
        paper: document.documentElement.classList.contains('dark') ? '#171717' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 1px 3px 0 rgba(0,0,0,0.12)',
          },
        },
      },
    },
  });

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="min-h-screen flex items-center justify-center bg-black-50 dark:bg-black-950 bg-pattern-grid">
          <CircularProgress color="primary" />
        </div>
      </ThemeProvider>
    );
  }

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-64 bg-black-50 dark:bg-black-950 bg-pattern-grid">
      <CircularProgress color="primary" />
    </div>
  );

  const router = createBrowserRouter([
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />
        },
        {
          path: 'dashboard',
          element: (
            <React.Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </React.Suspense>
          )
        },
        {
          path: 'projects',
          element: (
            <React.Suspense fallback={<LoadingFallback />}>
              <Projects />
            </React.Suspense>
          )
        },
        {
          path: 'projects/:id',
          element: (
            <React.Suspense fallback={<LoadingFallback />}>
              <ProjectDetails />
            </React.Suspense>
          )
        },
        {
          path: 'profile',
          element: (
            <React.Suspense fallback={<LoadingFallback />}>
              <Profile />
            </React.Suspense>
          )
        },
        {
          path: 'invitations',
          element: (
            <React.Suspense fallback={<LoadingFallback />}>
              <Invitations />
            </React.Suspense>
          )
        },
        {
          path: "projects/:projectId/tasks/:taskId",
          element: (
            <React.Suspense fallback={<LoadingFallback />}>
              <TaskDetails />
            </React.Suspense>
          )
        },
        {
          path: "tasks",
          element: (
            <React.Suspense fallback={<LoadingFallback />}>
              <Tasks />
            </React.Suspense>
          )
        }
      ]
    }
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App; 