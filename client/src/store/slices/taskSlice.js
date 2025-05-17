import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/tasks`);
      return { projectId, tasks: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/projects/${projectId}/tasks`,
        taskData
      );
      return { projectId, task: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ projectId, taskId, taskData }, { rejectWithValue }) => {
    if (!projectId || !taskId) {
      return rejectWithValue({ message: 'Project ID and Task ID are required' });
    }
    try {
      const response = await axiosInstance.put(
        `/projects/${projectId}/tasks/${taskId}`,
        taskData
      );
      return { projectId, task: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update task' });
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/projects/${projectId}/tasks/${taskId}`);
      return { projectId, taskId };
    } catch (error) {
      if (!error.response) {
        // Handle network errors
        return rejectWithValue({ message: 'Network error - please check if the server is running' });
      }
      return rejectWithValue(error.response.data || { message: 'Failed to delete task' });
    }
  }
);

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ projectId, taskId, text }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/projects/${projectId}/tasks/${taskId}/comments`,
        { text }
      );
      return { projectId, task: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  tasksByProject: {}, // Store tasks by project ID
  currentTask: null,
  loading: false,
  error: null
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    removeProjectTasks: (state, action) => {
      const projectId = action.payload;
      delete state.tasksByProject[projectId];
      if (state.currentTask?.project === projectId) {
        state.currentTask = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasksByProject[action.payload.projectId] = action.payload.tasks;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch tasks';
      })
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.tasksByProject[action.payload.projectId]) {
          state.tasksByProject[action.payload.projectId] = [];
        }
        state.tasksByProject[action.payload.projectId].push(action.payload.task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create task';
      })
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const projectTasks = state.tasksByProject[action.payload.projectId];
        if (projectTasks) {
          const index = projectTasks.findIndex(t => t._id === action.payload.task._id);
          if (index !== -1) {
            projectTasks[index] = action.payload.task;
          }
        }
        if (state.currentTask?._id === action.payload.task._id) {
          state.currentTask = action.payload.task;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update task';
      })
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, taskId } = action.payload;
        if (state.tasksByProject[projectId]) {
          state.tasksByProject[projectId] = state.tasksByProject[projectId].filter(
            task => task._id !== taskId
          );
        }
        if (state.currentTask?._id === taskId) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete task';
      })
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        const projectTasks = state.tasksByProject[action.payload.projectId];
        if (projectTasks) {
          const index = projectTasks.findIndex(t => t._id === action.payload.task._id);
          if (index !== -1) {
            projectTasks[index] = action.payload.task;
          }
        }
        if (state.currentTask?._id === action.payload.task._id) {
          state.currentTask = action.payload.task;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add comment';
      });
  }
});

export const { setCurrentTask, clearError, removeProjectTasks } = taskSlice.actions;
export default taskSlice.reducer; 