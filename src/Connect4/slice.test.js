/* globals jest, beforeEach, describe, expect, it */
import { configureStore } from '@reduxjs/toolkit';
import reducer, { initialState, makeMove, undoMove, resetGame } from './slice';
import { PLAYER_ONE, PLAYER_TWO } from './globals';
import * as utils from './utils';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  initializeBoard: jest.fn(() => jest.requireActual('./utils').initializeBoard()),
}));

describe('Connect4 Slice', () => {
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

  it('should make a move', () => {
    store.dispatch(makeMove({ col: 0 }))
    state = store.getState();
    expect(state.board[5][0]).toBe(PLAYER_ONE);
    expect(state.player).toBe(PLAYER_TWO);
  });

  it('should undo the last move', () => {
    store.dispatch(makeMove({ col: 0 }))
    state = store.getState();
    expect(state.board[5][0]).toBe(PLAYER_ONE);
    expect(state.player).toBe(PLAYER_TWO);
    store.dispatch(undoMove())
    state = store.getState();
    expect(state).toStrictEqual(initialState);
  });

  it('should not make a move in a full column', () => {
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 0 }))
    const stateAfter6ClicksOnCol = store.getState();
    store.dispatch(makeMove({ col: 0 }))
    const stateAfter7ClicksOnCol = store.getState();
    expect(stateAfter6ClicksOnCol).toStrictEqual(stateAfter7ClicksOnCol);
  });

  it('should drop to the correct cell when passed a column', () => {
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 2 }))
    state = store.getState()
    expect(state.board[5][0]).toBe(PLAYER_ONE);
    expect(state.board[4][0]).toBe(PLAYER_TWO);
    expect(state.player).toBe(PLAYER_TWO);
  });

  it('should declare a winner', () => {
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 1 }))
    store.dispatch(makeMove({ col: 1 }))
    store.dispatch(makeMove({ col: 2 }))
    store.dispatch(makeMove({ col: 2 }))
    store.dispatch(makeMove({ col: 3 }))
    state = store.getState()
    expect(state.board[5][3]).toBe(PLAYER_ONE);
    expect(state.winner).toBe(PLAYER_ONE);
    expect(state.winnerDesc).toContain('horizontal');
  });

  it('should reset a game', () => {
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 1 }))
    store.dispatch(makeMove({ col: 1 }))
    store.dispatch(makeMove({ col: 2 }))
    store.dispatch(makeMove({ col: 2 }))
    utils.initializeBoard.mockReturnValueOnce(jest.requireActual('./utils').initializeBoard());
    store.dispatch(resetGame())
    state = store.getState()
    expect(state.board).toStrictEqual(initialState.board)
  });

  it('should not make a move after the game is won', () => {
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 1 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 1 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 1 }))
    store.dispatch(makeMove({ col: 0 }))
    state = store.getState()
    expect(state.winner).toBe(PLAYER_ONE)
    store.dispatch(makeMove({ col: 1 }))
    const stateAfterAnotherMove = store.getState();
    expect(state).toStrictEqual(stateAfterAnotherMove)
  });

  it('should declare board is full', () => {
    const board = [
      [PLAYER_TWO, PLAYER_TWO, null, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
      [PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO],
      [PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
      [PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO],
      [PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
      [PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO],
      [PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
    ]
    utils.initializeBoard.mockReturnValueOnce(board);
    store.dispatch(resetGame())
    store.dispatch(makeMove({ col: 2 }))
    state = store.getState()
    expect(state.boardFull).toBe(true)
    expect(state.winner).toBe(null);
    expect(state.player).toBe(PLAYER_TWO);
  });

  it('should prioritize diagonal win over horizontal or vertical win', () => {
    const board = [
      [null, null, null, null],
      [PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, null],
      [PLAYER_ONE, PLAYER_ONE, PLAYER_ONE, PLAYER_TWO],
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
    ];
    utils.initializeBoard.mockReturnValueOnce(board);
    store.dispatch(resetGame())
    store.dispatch(makeMove({ col: 0 }))
    state = store.getState()
    expect(state.winner).toBe(PLAYER_ONE);
    expect(state.winnerDesc).toBe('diagonal');
  });
});
