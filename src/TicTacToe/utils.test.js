/* globals describe, expect, it */
import { PLAYER_ONE, PLAYER_TWO } from './globals';
import { calculateWinner, togglePlayer } from './utils';

describe('utils', () => {
  describe('calculateWinner', () => {
    it('should return the winner when a row is completed', () => {
      const squares = ['X', 'X', 'X', null, null, null, null, null, null];
      expect(calculateWinner(squares)).toBe('X');
    });

    it('should return the winner when a column is completed', () => {
      const squares = ['O', null, null, 'O', null, null, 'O', null, null];
      expect(calculateWinner(squares)).toBe('O');
    });

    it('should return the winner when a diagonal is completed', () => {
      const squares = ['X', null, null, null, 'X', null, null, null, 'X'];
      expect(calculateWinner(squares)).toBe('X');
    });

    it('should return null when there is no winner', () => {
      const squares = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      expect(calculateWinner(squares)).toBe(null);
    });

    it('should return null for an empty board', () => {
      const squares = [null, null, null, null, null, null, null, null, null];
      expect(calculateWinner(squares)).toBe(null);
    });
  });

  describe('togglePlayer', () => {
    it('should toggle from PLAYER_ONE to PLAYER_TWO', () => {
      expect(togglePlayer(PLAYER_ONE)).toBe(PLAYER_TWO);
    });

    it('should toggle from PLAYER_TWO to PLAYER_ONE', () => {
      expect(togglePlayer(PLAYER_TWO)).toBe(PLAYER_ONE);
    });
  });
});