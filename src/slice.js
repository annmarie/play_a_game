import { createSlice } from '@reduxjs/toolkit';
import { localStorageService } from './services/localStorage';

export const initialState = { name: localStorageService.getUserName() };

export const slice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
      localStorageService.saveUserName(action.payload);
    }
  },
});

export const { setName } = slice.actions;

export default slice.reducer;
