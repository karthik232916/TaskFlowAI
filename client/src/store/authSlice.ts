import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type User = {
  id: number;
  email: string;
  role: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  token: sessionStorage.getItem('token'),
  user: null,
  isAuthenticated: !!sessionStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      sessionStorage.setItem('token', action.payload.token);
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      sessionStorage.removeItem('token');
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;