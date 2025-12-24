import { isValidColumn, isValidMove } from '.';
import { PLAYER } from '../globals';

describe('isValidColumn', () => {
  it('should return valid for empty column', () => {
    const board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    const result = isValidColumn(1, board);
    expect(result).toEqual({ isValid: true, error: null });
  });

  it('should return invalid for full column', () => {
    const board = [
      [PLAYER.ONE, null, null],
      [PLAYER.TWO, null, null],
      [PLAYER.ONE, null, null],
    ];
    const result = isValidColumn(0, board);
    expect(result).toEqual({ isValid: false, error: 'Column is full' });
  });

  it('should return invalid for column out of bounds', () => {
    const board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    const result = isValidColumn(5, board);
    expect(result).toEqual({ isValid: false, error: 'Invalid column' });
  });

  it('should return invalid for negative column', () => {
    const board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    const result = isValidColumn(-1, board);
    expect(result).toEqual({ isValid: false, error: 'Invalid column' });
  });

  it('should return invalid for invalid board', () => {
    const result = isValidColumn(1, null);
    expect(result).toEqual({ isValid: false, error: 'Invalid board' });
  });
});

describe('isValidMove', () => {
  const mockBoard = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  it('should return valid for valid game state and column', () => {
    const state = {
      board: mockBoard,
      winner: null,
      isMultiplayer: false,
    };
    const result = isValidMove(state, 1);
    expect(result).toEqual({ isValid: true, error: null });
  });

  it('should return invalid when game has winner', () => {
    const state = {
      board: mockBoard,
      winner: PLAYER.ONE,
      isMultiplayer: false,
    };
    const result = isValidMove(state, 1);
    expect(result).toEqual({ isValid: false, error: 'Game already has a winner' });
  });

  it('should return invalid when not player turn in multiplayer', () => {
    const state = {
      board: mockBoard,
      winner: null,
      isMultiplayer: true,
      isMyTurn: false,
    };
    const result = isValidMove(state, 1);
    expect(result).toEqual({ isValid: false, error: 'Not your turn' });
  });

  it('should return valid when player turn in multiplayer', () => {
    const state = {
      board: mockBoard,
      winner: null,
      isMultiplayer: true,
      isMyTurn: true,
    };
    const result = isValidMove(state, 1);
    expect(result).toEqual({ isValid: true, error: null });
  });
});
