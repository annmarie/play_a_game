/* globals describe, expect, it */
import { PLAYER_LEFT, PLAYER_RIGHT, RIGHT_PLAYER_POINT_ORDER, LEFT_PLAYER_POINT_ORDER } from './globals';
import { initializeBoard, getPointOrder, getIndexToPointIdMap, getPointIdToIndexMap, generatePointIndexMap } from './boardUtils';

describe('Board Utilities', () => {
  describe('initializeBoard', () => {
    it('should return an array of 24 points', () => {
      const board = initializeBoard();
      expect(board).toHaveLength(24);
    });

    it('should initializes points with checkers and players', () => {
      const board = initializeBoard();

      expect(board[0]).toEqual({ id: 1, checkers: 5, player: PLAYER_LEFT });
      expect(board[11]).toEqual({ id: 12, checkers: 2, player: PLAYER_LEFT });
      expect(board[16]).toEqual({ id: 17, checkers: 3, player: PLAYER_LEFT });
      expect(board[18]).toEqual({ id: 19, checkers: 5, player: PLAYER_LEFT });

      expect(board[23]).toEqual({ id: 24, checkers: 2, player: PLAYER_RIGHT });
      expect(board[12]).toEqual({ id: 13, checkers: 5, player: PLAYER_RIGHT });
      expect(board[6]).toEqual({ id: 7, checkers: 5, player: PLAYER_RIGHT });
      expect(board[4]).toEqual({ id: 5, checkers: 3, player: PLAYER_RIGHT });

      expect(board[2]).toEqual({ id: 3, checkers: 0, player: null });
    });
  });

  describe('generatePointIndexMap', () => {
    it('should return correct index point mapping for PLAYER_RIGHT', () => {
      const pointIdToIndexMap = generatePointIndexMap(PLAYER_RIGHT, 'index');
      expect(pointIdToIndexMap[0]).toBe(23);
      expect(pointIdToIndexMap[11]).toBe(12);
      expect(pointIdToIndexMap[12]).toBe(0);
      expect(pointIdToIndexMap[23]).toBe(11);
    });

    it('should return correct index point mapping for PLAYER_LEFT', () => {
      const pointIdToIndexMap = generatePointIndexMap(PLAYER_LEFT, 'index');
      expect(pointIdToIndexMap[0]).toBe(11);
      expect(pointIdToIndexMap[11]).toBe(0);
      expect(pointIdToIndexMap[12]).toBe(12);
      expect(pointIdToIndexMap[23]).toBe(23);
    });

    it('should return correct point index mapping for PLAYER_RIGHT', () => {
      const pointIdToIndexMap = generatePointIndexMap(PLAYER_RIGHT, 'point');
      expect(pointIdToIndexMap[0]).toBe(12);
      expect(pointIdToIndexMap[11]).toBe(23);
      expect(pointIdToIndexMap[12]).toBe(11);
      expect(pointIdToIndexMap[23]).toBe(0);
    });

    it('should return correct point index mapping for PLAYER_LEFT', () => {
      const pointIdToIndexMap = generatePointIndexMap(PLAYER_LEFT, 'point');
      expect(pointIdToIndexMap[0]).toBe(11);
      expect(pointIdToIndexMap[11]).toBe(0);
      expect(pointIdToIndexMap[12]).toBe(12);
      expect(pointIdToIndexMap[23]).toBe(23);
    });

    it('getPointOrder returns the correct arrays for each player', () => {
      expect(getPointOrder(PLAYER_RIGHT)).toEqual(RIGHT_PLAYER_POINT_ORDER);
      expect(getPointOrder(PLAYER_LEFT)).toEqual(LEFT_PLAYER_POINT_ORDER);
    });

    it('getPointIdToIndexMap and getIndexToPointIdMap are consistent for PLAYER_RIGHT', () => {
      const map = getPointIdToIndexMap(PLAYER_RIGHT);
      const idx = getIndexToPointIdMap(PLAYER_RIGHT);

      for (let i = 0; i < 24; i++) {
        const pointIndex = idx[i];
        expect(map[pointIndex]).toBe(i);
      }
    });

    it('getPointIdToIndexMap and getIndexToPointIdMap are consistent for PLAYER_LEFT', () => {
      const map = getPointIdToIndexMap(PLAYER_LEFT);
      const idx = getIndexToPointIdMap(PLAYER_LEFT);
      for (let i = 0; i < 24; i++) {
        const pointIndex = idx[i];
        expect(map[pointIndex]).toBe(i);
      }
    });
  });
});