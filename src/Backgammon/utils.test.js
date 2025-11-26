/* globals describe, expect, it */
import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';
import {
  initializeBoard,
  rollDie,
  togglePlayer,
  generatePointIndexMap,
  calculatePotentialMove,
  findPotentialMoves,
  getPointOrder,
  getIndexToPointIdMap,
  getPointIdToIndexMap,
  rightPlayerPointOrder,
  leftPlayerPointOrder,
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

    it('getPointOrder returns the correct arrays for each player', () => {
      expect(getPointOrder(PLAYER_RIGHT)).toEqual(rightPlayerPointOrder);
      expect(getPointOrder(PLAYER_LEFT)).toEqual(leftPlayerPointOrder);
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
      expect(result).toEqual({ '21': [] });
    });

    it('should return potential moves for PLAYER_LEFT with dice [5,5,5,5] nobody on bar', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));
      points[0] = { 'id': 1, 'checkers': 3, 'player': PLAYER_LEFT }
      points[1] = { 'id': 2, 'checkers': 2, 'player': PLAYER_RIGHT }
      points[3] = { 'id': 4, 'checkers': 3, 'player': PLAYER_RIGHT }
      points[4] = { 'id': 5, 'checkers': 3, 'player': PLAYER_RIGHT }
      points[5] = { 'id': 6, 'checkers': 1, 'player': PLAYER_LEFT }
      points[6] = { 'id': 7, 'checkers': 3, 'player': PLAYER_RIGHT }
      points[7] = { 'id': 8, 'checkers': 2, 'player': PLAYER_RIGHT }
      points[8] = { 'id': 9, 'checkers': 1, 'player': PLAYER_LEFT }
      points[10] = { 'id': 11, 'checkers': 1, 'player': PLAYER_RIGHT }
      points[15] = { 'id': 16, 'checkers': 1, 'player': PLAYER_LEFT }
      points[16] = { 'id': 17, 'checkers': 3, 'player': PLAYER_LEFT }
      points[18] = { 'id': 19, 'checkers': 4, 'player': PLAYER_LEFT }
      points[19] = { 'id': 20, 'checkers': 2, 'player': PLAYER_LEFT }
      points[22] = { 'id': 23, 'checkers': 1, 'player': PLAYER_RIGHT }

      const player = PLAYER_LEFT;
      const diceValue = [5, 5, 5]
      const result = findPotentialMoves(points, player, diceValue, { left: 0, right: 0 });
      expect({ '1': [17], '6': [1], '16': [21], '17': [22], '19': [24] }).toEqual(result);
    })

    it('should allow bearing off when there are three moves left and the role is high', () => {
      const points = Array.from({ length: 24 }, (_, i) => {
        const id = i + 1;
        let checkers = 0;
        let player = null;
        return { id, checkers, player };
      })

      points[22] = { id: 23, checkers: 2, player: PLAYER_LEFT }
      points[23] = { id: 24, checkers: 1, player: PLAYER_LEFT }
      points[10] = { id: 11, checkers: 1, player: PLAYER_RIGHT }
      points[11] = { id: 12, checkers: 2, player: PLAYER_RIGHT }

      const canBearOffResult = canBearOff(points, PLAYER_LEFT, { left: 0, right: 0 });
      expect(canBearOffResult).toBe(true);

      const bearOffResult = moveCheckers(points, -1, 22, PLAYER_LEFT);
      expect(bearOffResult.updatedPoints[22].checkers).toBe(1);
      expect(bearOffResult.updatedPoints[23].checkers).toBe(1);

    });

    it('should not allow bearing off at point 10 when there are valid moves before this one', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));

      points[6] = { id: 7, checkers: 5, player: PLAYER_RIGHT }
      points[7] = { id: 8, checkers: 5, player: PLAYER_RIGHT }
      points[8] = { id: 9, checkers: 2, player: PLAYER_RIGHT }
      points[9] = { id: 10, checkers: 2, player: PLAYER_RIGHT }
      points[10] = { id: 11, checkers: 1, player: PLAYER_RIGHT }
      points[18] = { id: 19, checkers: 5, player: PLAYER_LEFT }
      points[19] = { id: 20, checkers: 3, player: PLAYER_LEFT }
      points[20] = { id: 21, checkers: 2, player: PLAYER_LEFT }
      points[21] = { id: 22, checkers: 3, player: PLAYER_LEFT }
      points[22] = { id: 23, checkers: 1, player: PLAYER_LEFT }

      const result = findPotentialMoves(points, PLAYER_RIGHT, [4, 4, 4], { left: 0, right: 0 });
      expect(result).toEqual({
        '7': [11],     // Point 7 can move to point 11 (with dice 4: 7+4=11)
        '8': [12],     // Point 8 can move to point 12 (with dice 4: 8+4=12)
        '9': [-1, -1], // Point 9 can bear off twice (has 2 checkers, both can bear off)
        '10': [-1, -1],// Point 10 should not be able to bear off (blocked by point 9)
        '11': [-1, -1] // Point 11 should not be able to bear off (blocked by point 9)
      });

      const canBearOffResult = canBearOff(points, PLAYER_RIGHT, { left: 0, right: 0 });
      expect(canBearOffResult).toBe(true);

      const bearOffResult = moveCheckers(points, -1, 10, PLAYER_RIGHT);
      expect(bearOffResult.updatedPoints[10].checkers).toBe(0);

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

  describe('Bearing Off Logic', () => {
    describe('canBearOff', () => {
      it('should allow left player to bear off when all checkers in home board (points 19-24)', () => {
        const points = Array.from({ length: 24 }, (_, i) => ({
          id: i + 1,
          checkers: 0,
          player: null
        }));

        points[18] = { id: 19, checkers: 5, player: PLAYER_LEFT };
        points[19] = { id: 20, checkers: 5, player: PLAYER_LEFT };
        points[20] = { id: 21, checkers: 5, player: PLAYER_LEFT };

        expect(canBearOff(points, PLAYER_LEFT, { left: 0, right: 0 })).toBe(true);
      });

      it('should allow right player to bear off when all checkers in home board (points 7-12)', () => {
        const points = Array.from({ length: 24 }, (_, i) => ({
          id: i + 1,
          checkers: 0,
          player: null
        }));

        points[6] = { id: 7, checkers: 5, player: PLAYER_RIGHT };
        points[7] = { id: 8, checkers: 5, player: PLAYER_RIGHT };
        points[8] = { id: 9, checkers: 5, player: PLAYER_RIGHT };

        expect(canBearOff(points, PLAYER_RIGHT, { left: 0, right: 0 })).toBe(true);
      });

      it('should not allow bearing off when checkers are on bar', () => {
        const points = Array.from({ length: 24 }, (_, i) => ({
          id: i + 1,
          checkers: 0,
          player: null
        }));

        points[0] = { id: 1, checkers: 5, player: PLAYER_LEFT };

        expect(canBearOff(points, PLAYER_LEFT, { left: 1, right: 0 })).toBe(false);
      });

      it('should not allow bearing off when checkers outside home board', () => {
        const points = Array.from({ length: 24 }, (_, i) => ({
          id: i + 1,
          checkers: 0,
          player: null
        }));

        // Left player has checker outside home board
        points[0] = { id: 1, checkers: 5, player: PLAYER_LEFT };
        points[6] = { id: 7, checkers: 1, player: PLAYER_LEFT }; // Outside home board

        expect(canBearOff(points, PLAYER_LEFT, { left: 0, right: 0 })).toBe(false);
      });
    });

    describe('calculatePotentialMove bearing off', () => {
      it('should return -2 when move goes beyond board for left player', () => {
        const result = calculatePotentialMove(PLAYER_LEFT, 0, 13); // Point 1, die 13
        expect(result).toBe(-2);
      });

      it('should return -2 when move goes beyond board for right player', () => {
        const result = calculatePotentialMove(PLAYER_RIGHT, 23, 24); // Point 24, die 24
        expect(result).toBe(-2);
      });

      it('should return valid point for normal moves', () => {
        const result = calculatePotentialMove(PLAYER_LEFT, 0, 3); // Point 1, die 3
        expect(result).toBe(14); // Should be a valid point
      });
    });

    describe('findPotentialMoves bearing off', () => {
      it('should include bearing off moves for left player in home board', () => {
        const points = Array.from({ length: 24 }, (_, i) => ({
          id: i + 1,
          checkers: 0,
          player: null
        }));

        points[18] = { id: 19, checkers: 2, player: PLAYER_LEFT };
        points[19] = { id: 20, checkers: 3, player: PLAYER_LEFT };
        points[22] = { id: 23, checkers: 1, player: PLAYER_LEFT };

        const result = findPotentialMoves(points, PLAYER_LEFT, [6, 5], { left: 0, right: 0 });

        expect(result[19]).toContain(-1); // Can bear off from point 19
        expect(result[20]).toContain(-1); // Can bear off from point 20
      });

      it('should include bearing off moves for right player in home board', () => {
        const points = Array.from({ length: 24 }, (_, i) => ({
          id: i + 1,
          checkers: 0,
          player: null
        }));

        points[10] = { id: 11, checkers: 2, player: PLAYER_RIGHT };
        points[11] = { id: 12, checkers: 3, player: PLAYER_RIGHT };

        const result = findPotentialMoves(points, PLAYER_RIGHT, [1, 2], { left: 0, right: 0 });

        expect(result[11]).toContain(-1); // Can bear off from point 11
        expect(result[12]).toContain(-1); // Can bear off from point 12
      });

      it('should not include bearing off when not all checkers in home board', () => {
        const points = Array.from({ length: 24 }, (_, i) => ({
          id: i + 1,
          checkers: 0,
          player: null
        }));

        points[18] = { id: 19, checkers: 2, player: PLAYER_LEFT };
        points[6] = { id: 7, checkers: 1, player: PLAYER_LEFT }; // Outside home board

        const result = findPotentialMoves(points, PLAYER_LEFT, [6], { left: 0, right: 0 });

        expect(result[19]).toBeUndefined(); // No moves available since can't bear off
      });
    });
  });
});
