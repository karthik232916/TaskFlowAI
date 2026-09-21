import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type TaskFilterState = {
  search: string
  priority: 'All' | 'Low' | 'Medium' | 'High'
}

const initialState: TaskFilterState = {
  search: '',
  priority: 'All',
}

const taskFilterSlice = createSlice({
  name: 'taskFilter',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },

    setPriority(
      state,
      action: PayloadAction<TaskFilterState['priority']>
    ) {
      state.priority = action.payload
    },

    resetFilters(state) {
      state.search = ''
      state.priority = 'All'
    },
  },
})

export const {
  setSearch,
  setPriority,
  resetFilters,
} = taskFilterSlice.actions

export default taskFilterSlice.reducer