import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, LoginResponse } from '../../../features/auth/types/auth';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      state.accessToken = action.payload.access_token;
      state.user = {
        _id: action.payload.payload._id,
        first_name: action.payload.payload.first_name,
        last_name: action.payload.payload.last_name,
        email: action.payload.payload.email,
        role_id: action.payload.payload.role_id,
        user_status_id: action.payload.payload.user_status_id,
        user_role: action.payload.payload.user_role,
      } as User;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setInitializationComplete: (state) => {
      state.isInitializing = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
  },
});

export const { setCredentials, setAccessToken, setUser, setInitializationComplete, logout } = authSlice.actions;
export default authSlice.reducer;
