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
  canBearOff,
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
      const result = findPotentialMoves(points, PLAYER_LEFT, [3, 5], {});
      expect(result).toEqual({
        '1': [15, 17],
        '12': [9],
        '17': [20, 22],
        '19': [22]
      });
    });

    it('should return potential moves PLAYER_RIGHT based on dice [3,5]', () => {
      const points = initializeBoard()
      const result = findPotentialMoves(points, PLAYER_RIGHT, [3, 5], {});
      expect(result).toEqual({
        '5': [8, 10],
        '7': [10],
        '13': [3, 5],
        '24': [21]
      });
    });

    it('should return potential moves PLAYER_RIGHT based on dice [3,5] when they are on the bar', () => {
      const points = initializeBoard()
      const result = findPotentialMoves(points, PLAYER_RIGHT, [3, 5], { 'right': 2 });
      expect(result).toEqual({ '21': []});
    });

    it('should return potential moves for PLAYER_LEFT with dice [5,5,5,5] nobody on bar', () => {
      const points = [
        { 'id': 1, 'checkers': 3, 'player': 'left' },
        { 'id': 2, 'checkers': 2, 'player': 'right' },
        { 'id': 3, 'checkers': 0, 'player': null },
        { 'id': 4, 'checkers': 3, 'player': 'right' },
        { 'id': 5, 'checkers': 3, 'player': 'right' },
        { 'id': 6, 'checkers': 1, 'player': 'left' },
        { 'id': 7, 'checkers': 3, 'player': 'right' },
        { 'id': 8, 'checkers': 2, 'player': 'right' },
        { 'id': 9, 'checkers': 1, 'player': 'left' },
        { 'id': 10, 'checkers': 0, 'player': null },
        { 'id': 11, 'checkers': 1, 'player': 'right' },
        { 'id': 12, 'checkers': 0, 'player': null },
        { 'id': 13, 'checkers': 0, 'player': null },
        { 'id': 14, 'checkers': 0, 'player': null },
        { 'id': 15, 'checkers': 0, 'player': null },
        { 'id': 16, 'checkers': 1, 'player': 'left' },
        { 'id': 17, 'checkers': 3, 'player': 'left' },
        { 'id': 18, 'checkers': 0, 'player': null },
        { 'id': 19, 'checkers': 4, 'player': 'left' },
        { 'id': 20, 'checkers': 2, 'player': 'left' },
        { 'id': 21, 'checkers': 0, 'player': null },
        { 'id': 22, 'checkers': 0, 'player': null },
        { 'id': 23, 'checkers': 1, 'player': 'right' },
        { 'id': 24, 'checkers': 0, 'player': null }
      ];
      const player = PLAYER_LEFT;
      const diceValue = [ 5, 5, 5, 5 ]
      const result = findPotentialMoves(points, player, diceValue, {});
      expect(result[1][0]).toEqual(17);
      expect(result[6][0]).toEqual(1);
      expect(result[16][0]).toEqual(21);
      expect(result[17][0]).toEqual(22);
      expect(result[19][0]).toEqual(24);
    })

    it('should return potential moves for PLAYER_RIGHT with dice [4,4,4] in mid-game', () => {
      const points = [
      { id: 1, checkers: 0, player: null },
      { id: 2, checkers: 0, player: null },
      { id: 3, checkers: 0, player: null },
      { id: 4, checkers: 0, player: null },
      { id: 5, checkers: 0, player: null },
      { id: 6, checkers: 0, player: null },
      { id: 7, checkers: 5, player: PLAYER_RIGHT },
      { id: 8, checkers: 5, player: PLAYER_RIGHT },
      { id: 9, checkers: 2, player: PLAYER_RIGHT },
      { id: 10, checkers: 2, player: PLAYER_RIGHT },
      { id: 11, checkers: 1, player: PLAYER_RIGHT },
      { id: 12, checkers: 0, player: null },
      { id: 13, checkers: 0, player: null },
      { id: 14, checkers: 0, player: null },
      { id: 15, checkers: 0, player: null },
      { id: 16, checkers: 0, player: null },
      { id: 17, checkers: 0, player: null },
      { id: 18, checkers: 0, player: null },
      { id: 19, checkers: 5, player: PLAYER_LEFT },
      { id: 20, checkers: 3, player: PLAYER_LEFT },
      { id: 21, checkers: 2, player: PLAYER_LEFT },
      { id: 22, checkers: 3, player: PLAYER_LEFT },
      { id: 23, checkers: 1, player: PLAYER_LEFT },
      { id: 24, checkers: 0, player: null }
    ];
      const result = findPotentialMoves(points, PLAYER_RIGHT, [4, 4, 4], { left: 0, right: 0 });
      expect(result).toEqual({
      '7': [ 11 ],     // Point 7 can move to point 11 (with dice 4: 7+4=11)
      '8': [ 12 ],     // Point 8 can move to point 12 (with dice 4: 8+4=12)
      '9': [ -1, -1 ], // Point 9 can bear off twice (has 2 checkers, both can bear off)
      '10': [ -1, -1 ],// Point 10 should not be able to bear off (blocked by point 9)
      '11': [ -1, -1 ] // Point 11 should not be able to bear off (blocked by point 9)
      });

      const canBearOffResult = canBearOff(points, PLAYER_RIGHT, { left: 0, right: 0 });
      expect(canBearOffResult).toBe(true);
    });
  });

  describe('moveCheckers', () => {
    it('should move a checker from one point to an empty spot', () => {
      const points = [
        { checkers: 5, player: PLAYER_RIGHT },
        { checkers: 0, player: null }
      ];
      const player = PLAYER_RIGHT;
      const { updatedPoints, hasBarPlayer } = moveCheckers(points, 1, 0, player);
      expect(updatedPoints[0].checkers).toBe(4);
      expect(updatedPoints[1].checkers).toBe(1);
      expect(updatedPoints[1].player).toBe(PLAYER_RIGHT);
      expect(hasBarPlayer).toBe('');
    });

    it('should remove player from a point when checkers reach 0', () => {
      const points = [
        { checkers: 1, player: PLAYER_RIGHT },
        { checkers: 0, player: null }
      ];
      const player = PLAYER_RIGHT;
      const { updatedPoints, hasBarPlayer } = moveCheckers(points, 1, 0, player);
      expect(updatedPoints[0].checkers).toBe(0);
      expect(updatedPoints[0].player).toBe(null);
      expect(updatedPoints[1].checkers).toBe(1);
      expect(updatedPoints[1].player).toBe(PLAYER_RIGHT);
      expect(hasBarPlayer).toBe('');
    });

    it('should update the checkers on the bar when the destination point belongs to the opponent', () => {
      const points = [
        { checkers: 1, player: PLAYER_RIGHT },
        { checkers: 1, player: PLAYER_LEFT }
      ];
      const player = PLAYER_RIGHT;
      const { updatedPoints, hasBarPlayer } = moveCheckers(points, 1, 0, player);
      expect(updatedPoints[0]).toEqual({ checkers: 0, player: null });
      expect(updatedPoints[1]).toEqual({ checkers: 1, player: PLAYER_RIGHT });
      expect(hasBarPlayer).toBe(PLAYER_LEFT);
    });

    it('should not update the checkers on the bar when the destination point belongs to the same player', () => {
      const points = [
        { checkers: 5, player: PLAYER_LEFT },
        { checkers: 1, player: PLAYER_LEFT }
      ];
      const player = PLAYER_LEFT;
      const { updatedPoints, hasBarPlayer } = moveCheckers(points, 1, 0, player);
      expect(updatedPoints[0].checkers).toBe(4);
      expect(updatedPoints[1].checkers).toBe(2);
      expect(hasBarPlayer).toBe('');
    });
  });
});
