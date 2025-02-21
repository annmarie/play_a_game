/* globals describe, expect, it */
import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';
import {
  initializeBoard,
  rollDie,
  togglePlayer,
  generatePointIndexMap,
  updatePoints,
  calculatePotentialMove,
  findPotentialMoves
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

    it('should calculate the correct potential moves', () => {
      const targetPoint = calculatePotentialMove(PLAYER_LEFT, 0, 3);
      expect(targetPoint).toBe(14);
    });

    it('should return 0 for the target point ID if invalid data is passed', () => {
      const targetPoint = calculatePotentialMove(PLAYER_RIGHT, 'invalid', 'invalid');
      expect(targetPoint).toBe(0);
    });

    it('should correctly update the board state', () => {
      const board = initializeBoard();
      const updatedBoard = updatePoints(board, 0, 1, PLAYER_LEFT);
      expect(updatedBoard[0].checkers).toBe(4);
      expect(updatedBoard[1].checkers).toBe(1);
      expect(updatedBoard[1].player).toBe(PLAYER_LEFT);
    });
  });

  describe('updatePoints', () => {
    it('should move a checker from one point to another', () => {
      const points = initializeBoard();
      const fromIndex = 0;
      const toIndex = 5;
      const player = PLAYER_LEFT;

      const updatedPoints = updatePoints(points, fromIndex, toIndex, player);

      expect(updatedPoints[fromIndex].checkers).toBe(4);
      expect(updatedPoints[fromIndex].player).toBe(PLAYER_LEFT);

      expect(updatedPoints[toIndex].checkers).toBe(1);
      expect(updatedPoints[toIndex].player).toBe(PLAYER_LEFT);
    });

    it('should remove player from a point when checkers reach 0', () => {
      const points = initializeBoard();
      const fromIndex = 11;
      const toIndex = 5;
      const player = PLAYER_LEFT;
      let updatedPoints = updatePoints(points, fromIndex, toIndex, player);
      updatedPoints = updatePoints(updatedPoints, fromIndex, toIndex, player);
      expect(updatedPoints[fromIndex].checkers).toBe(0);
      expect(updatedPoints[fromIndex].player).toBe(null);
    });

    it('should add a player to a point when checkers reach 1', () => {
      const points = initializeBoard();
      const fromIndex = 0;
      const toIndex = 2;
      const updatedPoints = updatePoints(points, fromIndex, toIndex, PLAYER_LEFT);
      expect(updatedPoints[toIndex].checkers).toBe(1);
      expect(updatedPoints[toIndex].player).toBe(PLAYER_LEFT);
    });
  });
});

describe('findPotentialMoves', () => {
  it('should return potential moves for a player based on dice values', () => {
    const points = initializeBoard()
    const result = findPotentialMoves(points, PLAYER_LEFT, [3,5]);
    expect(result).toEqual({
       '1': [ 15, 17 ],
       '12': [ 9 ],
       '17': [ 20, 22 ],
       '19': [ 22 ]
    });
  });
});
