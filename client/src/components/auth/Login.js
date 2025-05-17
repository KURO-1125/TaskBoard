import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { login } from '../../store/slices/authSlice';
import { auth, googleProvider } from '../../config/firebase';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Alert,
  CircularProgress,
  Box,
  useTheme
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import '../../styles/Login.css';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;
      
      // Get the ID token
      const idToken = await user.getIdToken();
      console.log('Got ID token:', idToken.substring(0, 10) + '...');
      
      // Dispatch login action
      const response = await dispatch(login({ idToken })).unwrap();
      console.log('Login response:', response);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error details:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="login-overlay" />
      
      <Card className="login-card">
        <CardContent sx={{ p: 5, textAlign: 'center' }}>
          <div className="login-logo-container">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={theme.palette.text.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke={theme.palette.text.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke={theme.palette.text.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <Typography 
            variant="h4" 
            component="h1" 
            className="login-title"
          >
            Welcome to TaskBoard Pro
          </Typography>
          
          <Typography 
            variant="body1" 
            className="login-subtitle"
          >
            Sign in to manage your projects and tasks
          </Typography>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`login-button ${isLoading ? 'loading' : ''}`}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          {error && (
            <Alert 
              severity="error" 
              className="login-error"
            >
              {error}
            </Alert>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 