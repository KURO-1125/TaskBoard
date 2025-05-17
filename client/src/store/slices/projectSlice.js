import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';
import { removeProjectTasks } from './taskSlice';

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/projects');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      console.log('Creating project with data:', JSON.stringify(projectData, null, 2));
      const response = await axiosInstance.post('/projects', projectData);
      console.log('Project created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', {
        status: error.response?.status,
        data: error.response?.data,
        error: error.message
      });
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/projects/${projectId}`);
      // Dispatch action to remove project tasks from state
      dispatch(removeProjectTasks(projectId));
      return projectId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const inviteUser = createAsyncThunk(
  'projects/inviteUser',
  async ({ projectId, email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/projects/${projectId}/invite`,
        { email }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch projects';
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create project';
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update project';
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete project';
      })
      // Invite User
      .addCase(inviteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to invite user';
      });
  }
});

export const { setCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer; 