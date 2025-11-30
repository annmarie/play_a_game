import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDebugMode: false,
};

const slice = createSlice({
  name: 'debug',
  initialState,
  reducers: {
    setDebugMode: (state, action) => {
      state.isDebugMode = Boolean(action.payload);
    },
    initializeDebugMode: (state) => {
      try {
        state.isDebugMode = new URLSearchParams(window.location.search).has('debug');
      } catch {
        state.isDebugMode = false;
      }
    },
  },
});

export const { setDebugMode, initializeDebugMode } = slice.actions;

export default slice.reducer;
