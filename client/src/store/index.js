import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import automationReducer from './slices/automationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    automations: automationReducer
  }
});

export default store; 