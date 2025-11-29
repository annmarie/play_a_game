import { createSlice } from '@reduxjs/toolkit';

export const debugInitialState = {
  isDebugMode: false,
};

export const debugSlice = createSlice({
  name: 'debug',
  initialState: debugInitialState,
  reducers: {
    setDebugMode: (state, action) => {
      state.isDebugMode = action.payload;
    },
    initializeDebugMode: (state) => {
      state.isDebugMode = new URLSearchParams(window.location.search).has('debug');
    },
  },
});

export const { setDebugMode, initializeDebugMode } = debugSlice.actions;

export default debugSlice.reducer;