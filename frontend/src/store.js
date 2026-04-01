import { configureStore, createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: localStorage.getItem('u'), token: localStorage.getItem('t') },
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.username;
      state.token = action.payload.token;
      localStorage.setItem('u', state.user);
      localStorage.setItem('t', state.token);
    },
    logout: () => { localStorage.clear(); window.location.reload(); }
  }
});

export const { setAuth, logout } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer } });