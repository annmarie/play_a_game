/* globals describe, expect, it */
import {
  hasWinningMove,
  hasMovesLeft,
  canJump,
  jumpPeg,
  validateJump,
} from './utils';

describe('Game Logic Functions', () => {
  describe('hasWinningMove', () => {
    it('sould return true if there is exactly one peg on the board', () => {
      const board = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];
      expect(hasWinningMove(board)).toBe(true);
    });

    it('should return false if there are no pegs on the board', () => {
      const board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      expect(hasWinningMove(board)).toBe(false);
    });

    it('should return false if there are more than one peg on the board', () => {
      const board = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];
      expect(hasWinningMove(board)).toBe(false);
    });
  });

  describe('hasMovesLeft', () => {
    it('should return true if there is at least one peg that can jump', () => {
      const board = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];
      expect(hasMovesLeft(board)).toBe(true);
    });

    it('should return false if no pegs can jump', () => {
      const board = [
        [0, 1, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      expect(hasMovesLeft(board)).toBe(false);
    });
  });

  describe('canJump', () => {
    it('should return true if a peg can jump over another peg into an empty spot', () => {
      const board = [
        [0, 1, 0],
        [1, 1, 0],
        [0, 0, 0],
      ];
      expect(canJump(board, 1, 0)).toBe(true);
    });

    it('should return false if a peg cannot jump', () => {
      const board = [
        [0, 1, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      expect(canJump(board, 0, 1)).toBe(false);
    });
  });

  describe('jumpPeg', () => {
    it('should update the board correctly after a valid jump', () => {
      const board = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];
      const newBoard = jumpPeg(board, 0, 1, 2, 1);
      expect(newBoard).toEqual([
        [0, 0, 0],
        [0, 0, 0],
        [0, 1, 0],
      ]);
    });
  });

  describe('validateJump', () => {
    it('should return true for a valid jump', () => {
      const board = [
        [0, 0, 0],
        [1, 1, 0],
        [0, 0, 0],
      ];
      expect(validateJump(board, 1, 0, 1, 2)).toBe(true);
    });

    it('should return false for an invalid jump', () => {
      const board = [
        [0, 1, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      expect(validateJump(board, 0, 1, 0, 2)).toBe(false);
    });
  });
});
