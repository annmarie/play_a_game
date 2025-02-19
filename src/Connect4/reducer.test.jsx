import { MAKE_MOVE, UNDO_MOVE, RESET_GAME } from "./actionTypes";
import { PLAYER_ONE, PLAYER_TWO } from "./globals";
import { initialState, reducer } from './reducer';

describe('Connect4 Reducer', () => {

  it('should return the initial state when no action is provided', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual(initialState);
  });

  it('should make a move', () => {
    const state = { ...initialState };
    const action = { type: MAKE_MOVE, payload: { col: 0 } };
    const newState = reducer(state, action);
    expect(newState.board[5][0]).toBe(PLAYER_ONE);
    expect(newState.player).toBe(PLAYER_TWO);
  });

  it('should not make a move in a full column', () => {
    const state = {
      ...initialState,
      board: [
        [PLAYER_TWO, null, null, null, null, null, null],
        [PLAYER_ONE, null, null, null, null, null, null],
        [PLAYER_TWO, null, null, null, null, null, null],
        [PLAYER_ONE, null, null, null, null, null, null],
        [PLAYER_TWO, null, null, null, null, null, null],
        [PLAYER_ONE, null, null, null, null, null, null],
      ],
      player: PLAYER_TWO
    };
    const action = { type: MAKE_MOVE, payload: { col: 0 } };
    const newState = reducer(state, action);
    expect(newState).toEqual(state);
  });

  it('should drop to the correct cell when passed a column', () => {
    const state = {
      ...initialState,
      board: [
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [PLAYER_TWO, null, null, null, null, null, null],
        [PLAYER_ONE, null, null, null, null, null, null],
      ],
      player: PLAYER_ONE,
    };
    const action = { type: MAKE_MOVE, payload: { col: 2 } };
    const newState = reducer(state, action);
    expect(newState.board[5][0]).toBe(PLAYER_ONE);
    expect(newState.board[4][0]).toBe(PLAYER_TWO);
    expect(newState.player).toBe(PLAYER_TWO);
  });

  it('should not make a move after the game is won', () => {
    const state = {
      ...initialState,
      board: [
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [PLAYER_ONE, null, null, null, null, null, null],
        [PLAYER_ONE, PLAYER_TWO, null, null, null, null, null],
        [PLAYER_ONE, PLAYER_TWO, null, null, null, null, null],
        [PLAYER_ONE, PLAYER_TWO, null, null, null, null, null],
      ],
      winner: PLAYER_ONE,
    };
    const action = { type: MAKE_MOVE, payload: { col: 1 } };
    const newState = reducer(state, action);
    expect(newState).toEqual(state);
  });

  it('should reset the game', () => {
    const state = {
      ...initialState,
      board: [
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [PLAYER_TWO, PLAYER_TWO, PLAYER_TWO, null, null, null, null],
        [PLAYER_ONE, PLAYER_ONE, PLAYER_ONE, null, null, null, null],
      ],
      player: PLAYER_TWO,
    };
    const action = { type: RESET_GAME };
    const newState = reducer(state, action);
    expect(newState).toStrictEqual(initialState);
  });

  it('should undo the last move', () => {
    const state = { ...initialState };
    const newState = reducer(state,  { type: MAKE_MOVE, payload: { col: 0 } });
    expect(newState.board[5][0]).toBe(PLAYER_ONE);
    expect(newState.player).toBe(PLAYER_TWO);
    const finalState = reducer(newState, { type: UNDO_MOVE});
    expect(finalState).toStrictEqual(initialState);
  });

  it('should declare a winner', () => {
    const state = {
      ...initialState,
      board: [
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [PLAYER_TWO, PLAYER_TWO, PLAYER_TWO, null, null, null, null],
        [PLAYER_ONE, PLAYER_ONE, PLAYER_ONE, null, null, null, null],
      ],
      player: PLAYER_ONE
    };
    const action = { type: MAKE_MOVE, payload: { col: 3 } };
    const newState = reducer(state, action);
    expect(newState.board[5][3]).toBe(PLAYER_ONE);
    expect(newState.winner).toBe(PLAYER_ONE);
    expect(newState.winnerDesc).toContain('horizontal');
  });

  it('should declare board is full', () => {
    const state = {
      ...initialState,
      board: [
        [PLAYER_TWO, PLAYER_TWO, null, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
        [PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO],
        [PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
        [PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO],
        [PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
        [PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_TWO],
        [PLAYER_TWO, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
      ],
      player: PLAYER_ONE
    }
    const action = { type: MAKE_MOVE, payload: { col: 2 } };
    const newState = reducer(state, action);
    expect(newState.boardFull).toBe(true)
    expect(newState.winner).toBe(null);
    expect(newState.player).toBe(PLAYER_TWO);
  });
});
