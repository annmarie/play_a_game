/* globals describe, expect, it */
import { setTiles, findEmptyTile, moveIsValid, makeMove, puzzleIsSolved } from './utils';

describe('Utils', () => {
  describe('setTiles', () => {
    it('should create an ordered grid when ordered is true', () => {
      const size = 3;
      const tiles = setTiles(size, true);
      const expected = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
      ];
      expect(tiles).toEqual(expected);
    });

    it('should create a shuffled grid when ordered is false', () => {
      const size = 3;
      const tiles = setTiles(size, false);
      const flatTiles = tiles.flat();
      expect(flatTiles).toContain(0);
      expect(flatTiles.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('findEmptyTile', () => {
    it('should find the position of the empty tile (0)', () => {
      const tiles = [
        [1, 2, 3],
        [4, 0, 6],
        [7, 8, 5],
      ];
      const emptyTile = findEmptyTile(tiles);
      expect(emptyTile).toEqual({ row: 1, col: 1 });
    });
  });

  describe('moveIsValid', () => {
    it('should return true for a valid move (adjacent tile)', () => {
      const emptyTile = { row: 1, col: 1 };
      const moveTile = { row: 1, col: 2 };
      expect(moveIsValid(emptyTile, moveTile)).toBe(true);
    });

    it('should return false for an invalid move (non-adjacent tile)', () => {
      const emptyTile = { row: 1, col: 1 };
      const moveTile = { row: 2, col: 2 };
      expect(moveIsValid(emptyTile, moveTile)).toBe(false);
    });
  });

  describe('makeMove', () => {
    it('should swap the empty tile with the move tile', () => {
      const tiles = [
        [1, 2, 3],
        [4, 0, 6],
        [7, 8, 5],
      ];
      const emptyTile = { row: 1, col: 1 };
      const moveTile = { row: 1, col: 2 };
      const newTiles = makeMove(tiles, emptyTile, moveTile);
      const expected = [
        [1, 2, 3],
        [4, 6, 0],
        [7, 8, 5],
      ];
      expect(newTiles).toEqual(expected);
    });
  });

  describe('puzzleIsSolved', () => {
    it('should return true for a solved puzzle', () => {
      const tiles = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
      ];
      expect(puzzleIsSolved(tiles)).toBe(true);
    });

    it('should return false for an unsolved puzzle', () => {
      const tiles = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 0, 8],
      ];
      expect(puzzleIsSolved(tiles)).toBe(false);
    });
  });
});
