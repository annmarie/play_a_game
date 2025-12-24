import { makeMoveLogic, togglePlayer } from '.';
import { PLAYER } from '../globals';

describe('togglePlayer', () => {
  it('should toggle from PLAYER_ONE to PLAYER_TWO', () => {
    expect(togglePlayer(PLAYER.ONE)).toBe(PLAYER.TWO);
  });

  it('should toggle from PLAYER_TWO to PLAYER_ONE', () => {
    expect(togglePlayer(PLAYER.TWO)).toBe(PLAYER.ONE);
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
      player: PLAYER.ONE,
      winner: PLAYER.TWO,
    };
    const result = makeMoveLogic(state, 1);
    expect(result).toEqual({ error: 'Game already has a winner' });
  });

  it('should return valid move result', () => {
    const state = {
      board: mockBoard,
      player: PLAYER.ONE,
      winner: null,
    };
    const result = makeMoveLogic(state, 1);
    expect(result.currentMove).toEqual({ row: 2, col: 1 });
    expect(result.player).toBe(PLAYER.TWO);
  });
});