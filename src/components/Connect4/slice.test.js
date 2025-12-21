import { configureStore } from '@reduxjs/toolkit';
import reducer, { initialState, makeMove, undoMove, resetGame } from './slice';
import { PLAYERS } from './globals';
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
    expect(state.board[5][0]).toBe(PLAYERS.ONE);
    expect(state.player).toBe(PLAYERS.TWO);
  });

  it('should undo the last move', () => {
    store.dispatch(makeMove({ col: 0 }))
    state = store.getState();
    expect(state.board[5][0]).toBe(PLAYERS.ONE);
    expect(state.player).toBe(PLAYERS.TWO);
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
    expect(state.board[5][0]).toBe(PLAYERS.ONE);
    expect(state.board[4][0]).toBe(PLAYERS.TWO);
    expect(state.player).toBe(PLAYERS.TWO);
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
    expect(state.board[5][3]).toBe(PLAYERS.ONE);
    expect(state.winner).toBe(PLAYERS.ONE);
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
    expect(state.winner).toBe(PLAYERS.ONE)
    store.dispatch(makeMove({ col: 1 }))
    const stateAfterAnotherMove = store.getState();
    expect(state).toStrictEqual(stateAfterAnotherMove)
  });

  it('should declare board is full', () => {
    const board = [
      [PLAYERS.TWO, PLAYERS.TWO, null, PLAYERS.ONE, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.ONE],
      [PLAYERS.ONE, PLAYERS.ONE, PLAYERS.TWO, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.TWO, PLAYERS.TWO],
      [PLAYERS.TWO, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.ONE, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.ONE],
      [PLAYERS.ONE, PLAYERS.ONE, PLAYERS.TWO, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.TWO, PLAYERS.TWO],
      [PLAYERS.TWO, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.ONE, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.ONE],
      [PLAYERS.ONE, PLAYERS.ONE, PLAYERS.TWO, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.TWO, PLAYERS.TWO]
    ]
    boardUtils.initializeBoard.mockReturnValueOnce(board);
    store.dispatch(resetGame())
    store.dispatch(makeMove({ col: 2 }))
    state = store.getState()
    expect(state.boardFull).toBe(true)
    expect(state.winner).toBe(null);
    expect(state.player).toBe(PLAYERS.TWO);
  });

  it('should prioritize diagonal win over horizontal or vertical win', () => {
    const board = [
      [null, null, null, null],
      [PLAYERS.ONE, PLAYERS.ONE, PLAYERS.TWO, null],
      [PLAYERS.ONE, PLAYERS.ONE, PLAYERS.ONE, PLAYERS.TWO],
      [PLAYERS.ONE, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.ONE],
    ];
    boardUtils.initializeBoard.mockReturnValueOnce(board);
    store.dispatch(resetGame())
    store.dispatch(makeMove({ col: 0 }))
    state = store.getState()
    expect(state.winner).toBe(PLAYERS.ONE);
    expect(state.winnerDesc).toBe('diagonal');
  });
});
