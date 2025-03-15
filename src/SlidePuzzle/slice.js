import { createSlice } from '@reduxjs/toolkit';
import { SIZE } from './globals';

import {
  setTiles, findEmptyTile, moveIsValid,
  makeMove, puzzleIsSolved
} from './utils';

export const initialState = {
  tiles: setTiles(SIZE, false),
  isSolved: false,
};

export const slice = createSlice({
  name: 'slidepuzzle',
  initialState,
  reducers: {
    moveTile: (state, action) => reduceMoveTile(state, action),
    resetGame: () => {
      return { ...initialState, tiles: setTiles(SIZE, false) };
    }
  },
});

function reduceMoveTile(state, action) {
  const moveTile = action.payload;
  const { tiles } = state;
  const emptyTile = findEmptyTile(tiles);

  if (moveIsValid(emptyTile, moveTile)) {
    const newTiles = makeMove(tiles, emptyTile, moveTile);
    const isSolved = puzzleIsSolved(newTiles);
    return { ...state, tiles: newTiles, isSolved };
  }

  return state;
}

export const { moveTile, resetGame } = slice.actions;

export default slice.reducer;
