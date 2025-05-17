import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchActivity = createAsyncThunk(
  'activity/fetchActivity',
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let url = `${API_URL}/activities`;
      if (projectId) {
        url += `?projectId=${projectId}`;
      } else if (userId) {
        url += `?userId=${userId}`;
      }

      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  activities: [],
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = activitySlice.actions;

export default activitySlice.reducer; 