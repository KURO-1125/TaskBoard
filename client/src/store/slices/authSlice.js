import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ idToken }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with token:', idToken.substring(0, 10) + '...');
      const response = await axiosInstance.post('/auth/google', { idToken });
      console.log('Login successful, storing token');
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        throw new Error('No token found');
      }

      console.log('Fetching current user with token:', token.substring(0, 10) + '...');
      const response = await axiosInstance.get('/auth/me');
      console.log('Current user fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        throw new Error('No token found');
      }

      console.log('Updating profile with data:', profileData);
      const response = await axiosInstance.put('/auth/profile', profileData);
      console.log('Profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      console.log('Logging out user');
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 