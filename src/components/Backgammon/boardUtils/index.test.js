import { PLAYERS } from '../globals';
import { initializeBoard, getIndexToPointIdMap, getPointIdToIndexMap } from './index';

describe('Board Utilities', () => {
  describe('initializeBoard', () => {
    it('should return an array of 24 points', () => {
      const board = initializeBoard();
      expect(board).toHaveLength(24);
    });

    it('should initializes points with checkers and players', () => {
      const board = initializeBoard();
      expect(board[0]).toEqual({ id: 1, checkers: 5, player: PLAYERS.LEFT });
      expect(board[11]).toEqual({ id: 12, checkers: 2, player: PLAYERS.LEFT });
      expect(board[16]).toEqual({ id: 17, checkers: 3, player: PLAYERS.LEFT });
      expect(board[18]).toEqual({ id: 19, checkers: 5, player: PLAYERS.LEFT });
      expect(board[23]).toEqual({ id: 24, checkers: 2, player: PLAYERS.RIGHT });
      expect(board[12]).toEqual({ id: 13, checkers: 5, player: PLAYERS.RIGHT });
      expect(board[6]).toEqual({ id: 7, checkers: 5, player: PLAYERS.RIGHT });
      expect(board[4]).toEqual({ id: 5, checkers: 3, player: PLAYERS.RIGHT });
      expect(board[2]).toEqual({ id: 3, checkers: 0, player: null });
    });
  });

  describe('point to index map', () => {
    it('should return correct index point mapping for PLAYER_RIGHT', () => {
      const pointIdToIndexMap = getIndexToPointIdMap(PLAYERS.RIGHT);
      expect(pointIdToIndexMap[0]).toBe(23);
      expect(pointIdToIndexMap[11]).toBe(12);
      expect(pointIdToIndexMap[12]).toBe(0);
      expect(pointIdToIndexMap[23]).toBe(11);
    });

    it('should return correct index point mapping for PLAYER_LEFT', () => {
      const pointIdToIndexMap = getIndexToPointIdMap(PLAYERS.LEFT);
      expect(pointIdToIndexMap[0]).toBe(11);
      expect(pointIdToIndexMap[11]).toBe(0);
      expect(pointIdToIndexMap[12]).toBe(12);
      expect(pointIdToIndexMap[23]).toBe(23);
    });

    it('should return correct point index mapping for PLAYER_RIGHT', () => {
      const pointIdToIndexMap = getPointIdToIndexMap(PLAYERS.RIGHT);
      expect(pointIdToIndexMap[0]).toBe(12);
      expect(pointIdToIndexMap[11]).toBe(23);
      expect(pointIdToIndexMap[12]).toBe(11);
      expect(pointIdToIndexMap[23]).toBe(0);
    });

    it('should return correct point index mapping for PLAYER_LEFT', () => {
      const pointIdToIndexMap = getPointIdToIndexMap(PLAYERS.LEFT);
      expect(pointIdToIndexMap[0]).toBe(11);
      expect(pointIdToIndexMap[11]).toBe(0);
      expect(pointIdToIndexMap[12]).toBe(12);
      expect(pointIdToIndexMap[23]).toBe(23);
    });
  });
});
