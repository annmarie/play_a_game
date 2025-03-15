/* globals jest, describe, expect, it, beforeEach */
import { configureStore } from '@reduxjs/toolkit';
import reducer, { initialState, selectPeg, makeMove, resetGame } from './slice';
import * as utils from './utils';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  initializeBoard: jest.fn((...args) => jest.requireActual('./utils').initializeBoard(...args)),
}));

describe('PegSolitiare Slice', () => {
  let store;
  let state;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({ reducer });
    state = store.getState();
  });

  it('should initialize with the correct state', () => {
    expect(state).toStrictEqual(initialState);
    expect(state.board[3][3]).toBe(0)
    expect(state.movesLeft).toEqual(true);
    expect(state.winner).toEqual(false);
  });

  it('should be able to select a peg', () => {
    expect(state.selectedPeg).toBe(null)
    store.dispatch(selectPeg({ row: 1, col: 3 }))
    state = store.getState();
    expect(state.selectedPeg.row).toBe(1)
    expect(state.selectedPeg.col).toBe(3)
  });

  it('should be able to make the first move', () => {
    expect(state.board[3][3]).toBe(0)
    expect(state.board[1][3]).toBe(1)
    store.dispatch(selectPeg({ row: 1, col: 3 }))
    state = store.getState();
    expect(state.selectedPeg.row).toBe(1)
    expect(state.selectedPeg.col).toBe(3)
    store.dispatch(makeMove({ endRow: 3, endCol: 3 }))
    state = store.getState();
    expect(state.board[1][3]).toBe(0)
    expect(state.board[2][3]).toBe(0)
    expect(state.board[3][3]).toBe(1)
  });

  it('should be able to make a move in both directions', () => {
    const board1 = [
      [null, null, 1, 1, 1, null, null],
      [null, null, 1, 0, 1, null, null],
      [1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [null, null, 1, 1, 1, null, null],
      [null, null, 1, 1, 1, null, null],
    ];

    expect(state.board[1][3]).toBe(1)
    store.dispatch(selectPeg({ row: 1, col: 3 }))
    store.dispatch(makeMove({ endRow: 3, endCol: 3 }))
    state = store.getState();
    expect(state.board).toStrictEqual(board1);

    const board2 = [
      [null, null, 1, 1, 1, null, null],
      [null, null, 1, 0, 1, null, null],
      [1, 0, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [null, null, 1, 1, 1, null, null],
      [null, null, 1, 1, 1, null, null],
    ];

    expect(state.board[2][1]).toBe(1)
    store.dispatch(selectPeg({ row: 2, col: 1 }))
    store.dispatch(makeMove({ endRow: 2, endCol: 3 }))
    state = store.getState();
    expect(state.board).toStrictEqual(board2);
  });

  it('should be able to make a winning move move', () => {
    const board = [
      [null, null, 0, 0, 0, null, null],
      [null, null, 0, 1, 0, null, null],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [null, null, 0, 0, 0, null, null],
      [null, null, 0, 0, 0, null, null],
    ];

    utils.initializeBoard.mockReturnValueOnce(board);
    store.dispatch(resetGame());
    state = store.getState();
    expect(state.board).toStrictEqual(board)
    store.dispatch(selectPeg({ row: 1, col: 3 }))
    store.dispatch(makeMove({ endRow: 3, endCol: 3 }))
    state = store.getState();
    expect(state.movesLeft).toEqual(false);
    expect(state.winner).toEqual(true);
  });

  it('should have at least one move left', () => {
    const board = [
        [null, null, 0, 0, 0, null, null],
        [null, null, 0, 1, 0, null, null],
        [   0,   0,  0, 1, 0,   0,     0],
        [   0,   0,  0, 1, 0,   0,     0],
        [   0,   0,  0, 0, 0,   0,     0],
        [null, null, 0, 1, 0, null, null],
        [null, null, 0, 0, 0, null, null],
    ];
    utils.initializeBoard.mockReturnValueOnce(board);
    store.dispatch(resetGame());
    state = store.getState();
    expect(state.board).toStrictEqual(board)
    store.dispatch(selectPeg({ row: 2, col: 3 }))
    store.dispatch(makeMove({ endRow: 4, endCol: 3 }))
    state = store.getState();
    expect(state.movesLeft).toEqual(true);
  });

  it('should have no move left', () => {
    const board = [
      [null, null, 0, 0, 0, null, null],
      [null, null, 0, 1, 0, null, null],
      [   0,   0,  0, 1, 0,   0,     0],
      [   0,   0,  0, 1, 0,   0,     0],
      [   0,   0,  0, 0, 0,   0,     0],
      [null, null, 0, 0, 0, null, null],
      [null, null, 0, 0, 0, null, null],
    ];
    utils.initializeBoard.mockReturnValueOnce(board);
    store.dispatch(resetGame());
    state = store.getState();
    expect(state.board).toStrictEqual(board)
    store.dispatch(selectPeg({ row: 2, col: 3 }))
    store.dispatch(makeMove({ endRow: 4, endCol: 3 }))
    state = store.getState();
    expect(state.movesLeft).toEqual(false);
  });
});
