/* globals beforeEach, describe, expect, it */
import { configureStore } from '@reduxjs/toolkit';
import reducer, { initialState, makeMove, undoMove, resetGame } from './slice';
import { PLAYER_ONE, PLAYER_TWO } from './globals';
import { initializeBoard } from './utils';

describe('TicTacToe Slice', () => {
  let store;
  let state;

  beforeEach(() => {
    store = configureStore({ reducer });
    state = store.getState();
  });

  it('should initialize with the correct state', () => {
    expect(state).toEqual(initialState);
  });

  it('should handle makeMove correctly', () => {
    store.dispatch(makeMove(0));
    state = store.getState();
    expect(state.board[0]).toBe(PLAYER_ONE);
    expect(state.player).toBe(PLAYER_TWO);
    expect(state.history.length).toBe(1);
  });

  it('should not allow moves on an already occupied cell', () => {
    store.dispatch(makeMove(0));
    store.dispatch(makeMove(0));
    state = store.getState();
    expect(state.board[0]).toBe(PLAYER_ONE);
    expect(state.history.length).toBe(1);
  });

  it('should undo a move', () => {
    state = store.getState();
    expect(state.board[0]).toBe(null);
    store.dispatch(makeMove(0));
    state = store.getState();
    expect(state.board[0]).toBe(PLAYER_ONE);
    expect(state.history.length).toBe(1);
    expect(state.player).toBe(PLAYER_TWO);
    store.dispatch(undoMove());
    state = store.getState();
    expect(state.player).toBe(PLAYER_ONE);
    expect(state.history.length).toBe(0);
    expect(state.board[0]).toBe(null);
  });

  it('should reset the game', () => {
    store.dispatch(makeMove(0));
    store.dispatch(makeMove(1));
    store.dispatch(makeMove(2));
    store.dispatch(makeMove(3));
    store.dispatch(makeMove(4));
    store.dispatch(makeMove(6));
    store.dispatch(makeMove(5));
    store.dispatch(makeMove(8));
    store.dispatch(makeMove(7));
    store.dispatch(resetGame());
    state = store.getState();
    expect(state).toStrictEqual(initialState)

  });

  it('should not undo or make a move after the game is won', () => {
    store.dispatch(makeMove(0));
    store.dispatch(makeMove(3));
    store.dispatch(makeMove(2));
    store.dispatch(makeMove(4));
    store.dispatch(makeMove(1));
    state = store.getState();
    expect(state.winner).toBe(PLAYER_ONE);
    store.dispatch(undoMove());
    const state2 = store.getState();
    expect(state).toStrictEqual(state2); // nothing changed
    store.dispatch(makeMove(1));
    const state3 = store.getState();
    expect(state).toStrictEqual(state3); // nothing changed
  });

  it('should not undo if there is no history', () => {
    store.dispatch(undoMove());
    state = store.getState();
    expect(state.history.length).toBe(0);
    expect(state.board).toEqual(initializeBoard());
  });
});
