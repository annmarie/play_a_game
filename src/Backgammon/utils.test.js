/* globals describe, expect, it */
import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';
import {
  initializeBoard,
  rollDie,
  togglePlayer,
  generatePointIndexMap,
  calculatePotentialMove,
  findPotentialMoves,
  moveCheckers,
  initializeCheckersOnBar
} from './utils';

describe('Utility Functions', () => {
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

  describe('rollDie', () => {
    it('should return a number between 1 and 6', () => {
      for (let i = 0; i < 100; i++) {
        const roll = rollDie();
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('togglePlayer', () => {
    it('should toggle from PLAYER_RIGHT to PLAYER_LEFT', () => {
      expect(togglePlayer(PLAYER_RIGHT)).toBe(PLAYER_LEFT);
    });

    it('should toggle from PLAYER_LEFT to PLAYER_RIGHT', () => {
      expect(togglePlayer(PLAYER_LEFT)).toBe(PLAYER_RIGHT);
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
  });

  describe('calculatePotentialMove', () => {
    it('should calculate the correct potential moves', () => {
      const targetPoint = calculatePotentialMove(PLAYER_LEFT, 0, 3);
      expect(targetPoint).toBe(14);
    });

    it('should return 0 for the target point ID if invalid data is passed', () => {
      const targetPoint = calculatePotentialMove(PLAYER_RIGHT, 'invalid', 'invalid');
      expect(targetPoint).toBe(-1);
    });
  });

  describe('findPotentialMoves', () => {
    it('should return potential moves PLAYER_LEFT based on dice [3,5]', () => {
      const points = initializeBoard()
      const result = findPotentialMoves(points, PLAYER_LEFT, [3, 5]);
      expect(result).toEqual({
        '1': [15, 17],
        '12': [9],
        '17': [20, 22],
        '19': [22]
      });
    });

    it('should return potential moves PLAYER_RIGHT based on dice [3,5]', () => {
      const points = initializeBoard()
      const result = findPotentialMoves(points, PLAYER_RIGHT, [3, 5]);
      expect(result).toEqual({
        '5': [8, 10],
        '7': [10],
        '13': [3, 5],
        '24': [21]
      });
    });
  });
  describe('moveCheckers', () => {

    it('should move a checker from one point to an empty spot', () => {
      const points = [
        { checkers: 5, player: PLAYER_RIGHT },
        { checkers: 0, player: null }
      ];
      const checkersOnBar = initializeCheckersOnBar();
      const player = PLAYER_RIGHT;
      const { updatedPoints, updatedCheckersOnBar } = moveCheckers(points, checkersOnBar, 1, 0, player);
      expect(updatedPoints[0].checkers).toBe(4);
      expect(updatedPoints[1].checkers).toBe(1);
      expect(updatedPoints[1].player).toBe(PLAYER_RIGHT);
      expect(updatedCheckersOnBar[PLAYER_LEFT]).toBe(0);
      expect(updatedCheckersOnBar[PLAYER_RIGHT]).toBe(0);
    });

    it('should remove player from a point when checkers reach 0', () => {
      const points = [
        { checkers: 1, player: PLAYER_RIGHT },
        { checkers: 0, player: null }
      ];
      const checkersOnBar = initializeCheckersOnBar();
      const player = PLAYER_RIGHT;
      const { updatedPoints, updatedCheckersOnBar } = moveCheckers(points, checkersOnBar, 1, 0, player);
      expect(updatedPoints[0].checkers).toBe(0);
      expect(updatedPoints[0].player).toBe(null);
      expect(updatedPoints[1].checkers).toBe(1);
      expect(updatedPoints[1].player).toBe(PLAYER_RIGHT);
      expect(updatedCheckersOnBar[PLAYER_RIGHT]).toBe(0)
      expect(updatedCheckersOnBar[PLAYER_LEFT]).toBe(0)
    });

    it('should update the checkers on the bar when the destination point belongs to the opponent', () => {
      const points = [
        { checkers: 1, player: PLAYER_RIGHT },
        { checkers: 1, player: PLAYER_LEFT }
      ];
      const checkersOnBar = initializeCheckersOnBar();
      const player = PLAYER_RIGHT;
      const { updatedPoints, updatedCheckersOnBar } = moveCheckers(points, checkersOnBar, 1, 0, player);
      expect(updatedPoints[0]).toEqual({ checkers: 0, player: null });
      expect(updatedCheckersOnBar[PLAYER_LEFT]).toBe(1);
    });

    it('should not update the checkers on the bar when the destination point belongs to the same player', () => {
      const points = [
        { checkers: 5, player: PLAYER_LEFT },
        { checkers: 1, player: PLAYER_LEFT }
      ];
      const checkersOnBar = { 0: 0, 1: 0 };
      const player = PLAYER_LEFT;
      const { updatedPoints, updatedCheckersOnBar } = moveCheckers(points, checkersOnBar, 1, 0, player);
      expect(updatedPoints[0].checkers).toBe(4);
      expect(updatedPoints[1].checkers).toBe(2);
      expect(updatedCheckersOnBar[0]).toEqual(checkersOnBar[0])
      expect(updatedCheckersOnBar[1]).toEqual(checkersOnBar[0])
      expect(updatedPoints[1].player).toBe(PLAYER_LEFT);
    });
  });
});
