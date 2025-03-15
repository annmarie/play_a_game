/* globals jest, beforeEach, describe, expect, it */
import { configureStore } from '@reduxjs/toolkit';
import reducer, { initialState, moveTile, resetGame } from './slice';
import * as utils from './utils';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  setTiles: jest.fn(() => [[5, 4, 3], [2, 1, 8], [7, 0, 6]]),
}));

describe('SlidePuzzle Slice', () => {
  let store;
  let state;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({ reducer });
    state = store.getState();
  });

  it('should initialize with the correct state', () => {
    expect(state).toEqual(initialState);
  });

  it('should move a tile when with a valid Winning move', () => {
    utils.setTiles.mockReturnValueOnce([[1, 2, 3], [4, 5, 6], [7, 0, 8]]);
    store.dispatch(resetGame());
    state = store.getState();
    expect(state.tiles[2][1]).toEqual(0)
    store.dispatch(moveTile({ row: 2, col: 2 }))
    state = store.getState();
    expect(state.tiles).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 0]]);
    expect(state.isSolved).toBe(true);
  });

  it('should not move a tile with an invalid move', () => {
    utils.setTiles.mockReturnValueOnce([[1, 2, 3], [4, 5, 6], [7, 0, 8]]);
    store.dispatch(resetGame());
    state = store.getState();
    expect(state.tiles[2][1]).toEqual(0)
    store.dispatch(moveTile({ row: 0, col: 0 }))
    const state1 = store.getState();
    expect(state).toStrictEqual(state1)
  });
});
