import { makeMoveLogic, togglePlayer } from '.';
import { PLAYERS } from '../globals';

describe('togglePlayer', () => {
  it('should toggle from PLAYER_ONE to PLAYER_TWO', () => {
    expect(togglePlayer(PLAYERS.ONE)).toBe(PLAYERS.TWO);
  });

  it('should toggle from PLAYER_TWO to PLAYER_ONE', () => {
    expect(togglePlayer(PLAYERS.TWO)).toBe(PLAYERS.ONE);
  });
});

describe('makeMoveLogic', () => {
  const mockBoard = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  it('should return error for invalid move', () => {
    const state = {
      board: mockBoard,
      player: PLAYERS.ONE,
      winner: PLAYERS.TWO,
    };
    const result = makeMoveLogic(state, 1);
    expect(result).toEqual({ error: 'Game already has a winner' });
  });

  it('should return valid move result', () => {
    const state = {
      board: mockBoard,
      player: PLAYERS.ONE,
      winner: null,
    };
    const result = makeMoveLogic(state, 1);
    expect(result.currentMove).toEqual({ row: 2, col: 1 });
    expect(result.player).toBe(PLAYERS.TWO);
  });
});