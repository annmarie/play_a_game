import { configureStore } from '@reduxjs/toolkit';
import reducer, { initialState, makeMove, undoMove, resetGame } from './slice';
import { PLAYER } from './globals';
import * as boardUtils from './boardUtils';

jest.mock('./boardUtils', () => ({
  ...jest.requireActual('./boardUtils'),
  initializeBoard: jest.fn(() => jest.requireActual('./boardUtils').initializeBoard()),
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
    expect(state.board[5][0]).toBe(PLAYER.ONE);
    expect(state.player).toBe(PLAYER.TWO);
  });

  it('should undo the last move', () => {
    store.dispatch(makeMove({ col: 0 }))
    state = store.getState();
    expect(state.board[5][0]).toBe(PLAYER.ONE);
    expect(state.player).toBe(PLAYER.TWO);
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
    expect(state.board[5][0]).toBe(PLAYER.ONE);
    expect(state.board[4][0]).toBe(PLAYER.TWO);
    expect(state.player).toBe(PLAYER.TWO);
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
    expect(state.board[5][3]).toBe(PLAYER.ONE);
    expect(state.winner).toBe(PLAYER.ONE);
    expect(state.winnerDesc).toContain('horizontal');
  });

  it('should reset a game', () => {
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 0 }))
    store.dispatch(makeMove({ col: 1 }))
    store.dispatch(makeMove({ col: 1 }))
    store.dispatch(makeMove({ col: 2 }))
    store.dispatch(makeMove({ col: 2 }))
    boardUtils.initializeBoard.mockReturnValueOnce(jest.requireActual('./boardUtils').initializeBoard());
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
    expect(state.winner).toBe(PLAYER.ONE)
    store.dispatch(makeMove({ col: 1 }))
    const stateAfterAnotherMove = store.getState();
    expect(state).toStrictEqual(stateAfterAnotherMove)
  });

  it('should declare board is full', () => {
    const board = [
      [PLAYER.TWO, PLAYER.TWO, null, PLAYER.ONE, PLAYER.TWO, PLAYER.ONE, PLAYER.ONE],
      [PLAYER.ONE, PLAYER.ONE, PLAYER.TWO, PLAYER.TWO, PLAYER.ONE, PLAYER.TWO, PLAYER.TWO],
      [PLAYER.TWO, PLAYER.TWO, PLAYER.ONE, PLAYER.ONE, PLAYER.TWO, PLAYER.ONE, PLAYER.ONE],
      [PLAYER.ONE, PLAYER.ONE, PLAYER.TWO, PLAYER.TWO, PLAYER.ONE, PLAYER.TWO, PLAYER.TWO],
      [PLAYER.TWO, PLAYER.TWO, PLAYER.ONE, PLAYER.ONE, PLAYER.TWO, PLAYER.ONE, PLAYER.ONE],
      [PLAYER.ONE, PLAYER.ONE, PLAYER.TWO, PLAYER.TWO, PLAYER.ONE, PLAYER.TWO, PLAYER.TWO]
    ]
    boardUtils.initializeBoard.mockReturnValueOnce(board);
    store.dispatch(resetGame())
    store.dispatch(makeMove({ col: 2 }))
    state = store.getState()
    expect(state.boardFull).toBe(true)
    expect(state.winner).toBe(null);
    expect(state.player).toBe(PLAYER.TWO);
  });

  it('should prioritize diagonal win over horizontal or vertical win', () => {
    const board = [
      [null, null, null, null],
      [PLAYER.ONE, PLAYER.ONE, PLAYER.TWO, null],
      [PLAYER.ONE, PLAYER.ONE, PLAYER.ONE, PLAYER.TWO],
      [PLAYER.ONE, PLAYER.TWO, PLAYER.ONE, PLAYER.ONE],
    ];
    boardUtils.initializeBoard.mockReturnValueOnce(board);
    store.dispatch(resetGame())
    store.dispatch(makeMove({ col: 0 }))
    state = store.getState()
    expect(state.winner).toBe(PLAYER.ONE);
    expect(state.winnerDesc).toBe('diagonal');
  });
});
