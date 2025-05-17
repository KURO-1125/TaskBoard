import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login with Google. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://img.freepik.com/free-vector/gradient-network-connection-background_23-2148879890.jpg?semt=ais_hybrid&w=740")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 1,
        }}
      />
      
      <Card
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '400px',
          margin: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          animation: 'fadeIn 0.5s ease-out',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
          '@keyframes fadeIn': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              margin: '0 auto 32px',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={theme.palette.primary.main} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke={theme.palette.primary.main} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke={theme.palette.primary.main} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>

          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              mb: 1,
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Welcome to TaskBoard Pro
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: 'text.secondary'
            }}
          >
            Sign in to manage your projects and tasks
          </Typography>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
            sx={{
              height: 48,
              borderRadius: 3,
              mb: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
              '&.Mui-disabled': {
                opacity: 0.8,
              },
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 3,
                border: `1px solid ${theme.palette.error.light}`,
              }}
            >
              {error}
            </Alert>
          )}

          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'primary.dark',
                },
              },
            }}
          >
            By signing in, you agree to our{' '}
            <a href="/terms">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy">Privacy Policy</a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login; 