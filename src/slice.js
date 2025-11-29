import { createSlice } from '@reduxjs/toolkit';

export const initialState = { name: null };

export const slice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    }
  },
});

export const { setName } = slice.actions;

export default slice.reducer;
