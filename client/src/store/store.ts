import { configureStore } from '@reduxjs/toolkit';
import taskFilterReducer from './taskFilterSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    taskFilter: taskFilterReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;