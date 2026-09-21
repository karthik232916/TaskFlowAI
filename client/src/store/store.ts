import { configureStore } from '@reduxjs/toolkit'
import taskFilterReducer from './taskFilterSlice'

export const store = configureStore({
  reducer: {
    taskFilter: taskFilterReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch