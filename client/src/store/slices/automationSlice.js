import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchAutomations = createAsyncThunk(
  'automations/fetchAutomations',
  async (projectId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects/${projectId}/automations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createAutomation = createAsyncThunk(
  'automations/createAutomation',
  async ({ projectId, automationData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/projects/${projectId}/automations`,
        automationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAutomation = createAsyncThunk(
  'automations/updateAutomation',
  async ({ automationId, automationData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/automations/${automationId}`,
        automationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAutomation = createAsyncThunk(
  'automations/deleteAutomation',
  async (automationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/automations/${automationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return automationId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const testAutomation = createAsyncThunk(
  'automations/testAutomation',
  async ({ projectId, automationData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/projects/${projectId}/automations/test`,
        automationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  automations: [],
  currentAutomation: null,
  loading: false,
  error: null
};

const automationSlice = createSlice({
  name: 'automations',
  initialState,
  reducers: {
    setCurrentAutomation: (state, action) => {
      state.currentAutomation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Automations
      .addCase(fetchAutomations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAutomations.fulfilled, (state, action) => {
        state.loading = false;
        state.automations = action.payload;
      })
      .addCase(fetchAutomations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch automations';
      })
      // Create Automation
      .addCase(createAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAutomation.fulfilled, (state, action) => {
        state.loading = false;
        state.automations.push(action.payload);
      })
      .addCase(createAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create automation';
      })
      // Update Automation
      .addCase(updateAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAutomation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.automations.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.automations[index] = action.payload;
        }
        if (state.currentAutomation?._id === action.payload._id) {
          state.currentAutomation = action.payload;
        }
      })
      .addCase(updateAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update automation';
      })
      // Delete Automation
      .addCase(deleteAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAutomation.fulfilled, (state, action) => {
        state.loading = false;
        state.automations = state.automations.filter(a => a._id !== action.payload);
        if (state.currentAutomation?._id === action.payload) {
          state.currentAutomation = null;
        }
      })
      .addCase(deleteAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete automation';
      })
      // Test Automation
      .addCase(testAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testAutomation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(testAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to test automation';
      });
  }
});

export const { setCurrentAutomation, clearError } = automationSlice.actions;
export default automationSlice.reducer; 