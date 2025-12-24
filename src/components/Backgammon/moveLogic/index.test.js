import { PLAYER } from '../globals';
import { initializeBoard } from '../boardUtils';
import { calculatePotentialMove, findPotentialMoves, moveCheckers, canBearOff, validateBearOffMove } from './index';

describe('Move Validation', () => {
  describe('calculatePotentialMove', () => {
    it('should calculate the correct potential moves', () => {
      const targetPoint = calculatePotentialMove(PLAYER.LEFT, 0, 3);
      expect(targetPoint).toBe(14);
    });

    it('should return 0 for the target point ID if invalid data is passed', () => {
      const targetPoint = calculatePotentialMove(PLAYER.RIGHT, 'invalid', 'invalid');
      expect(targetPoint).toBe(-1);
    });
  });

  describe('findPotentialMoves', () => {
    it('should return potential moves PLAYER_LEFT based on dice [3,5]', () => {
      const points = initializeBoard()
      const result = findPotentialMoves(points, PLAYER.LEFT, [3, 5], {});
      expect(result).toEqual({
        '1': [15, 17],
        '12': [9],
        '17': [20, 22],
        '19': [22]
      });
    });

    it('should return potential moves PLAYER_RIGHT based on dice [3,5]', () => {
      const points = initializeBoard()
      const result = findPotentialMoves(points, PLAYER.RIGHT, [3, 5], {});
      expect(result).toEqual({
        '5': [8, 10],
        '7': [10],
        '13': [3, 5],
        '24': [21]
      });
    });

    it('should return potential moves PLAYER_RIGHT based on dice [3,5] when they are on the bar', () => {
      const points = initializeBoard()
      const result = findPotentialMoves(points, PLAYER.RIGHT, [6, 3], { 'right': 2 });
      expect(result).toEqual({ '22': [] });
    });

    it('should return potential moves for PLAYER_LEFT with dice [5,5,5] nobody on bar', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));
      points[0] = { 'id': 1, 'checkers': 3, 'player': PLAYER.LEFT }
      points[1] = { 'id': 2, 'checkers': 2, 'player': PLAYER.RIGHT }
      points[3] = { 'id': 4, 'checkers': 3, 'player': PLAYER.RIGHT }
      points[4] = { 'id': 5, 'checkers': 3, 'player': PLAYER.RIGHT }
      points[5] = { 'id': 6, 'checkers': 1, 'player': PLAYER.LEFT }
      points[6] = { 'id': 7, 'checkers': 3, 'player': PLAYER.RIGHT }
      points[7] = { 'id': 8, 'checkers': 2, 'player': PLAYER.RIGHT }
      points[8] = { 'id': 9, 'checkers': 1, 'player': PLAYER.LEFT }
      points[10] = { 'id': 11, 'checkers': 1, 'player': PLAYER.RIGHT }
      points[15] = { 'id': 16, 'checkers': 1, 'player': PLAYER.LEFT }
      points[16] = { 'id': 17, 'checkers': 3, 'player': PLAYER.LEFT }
      points[18] = { 'id': 19, 'checkers': 4, 'player': PLAYER.LEFT }
      points[19] = { 'id': 20, 'checkers': 2, 'player': PLAYER.LEFT }
      points[22] = { 'id': 23, 'checkers': 1, 'player': PLAYER.RIGHT }

      const player = PLAYER.LEFT;
      const diceValue = [5, 5, 5]
      const result = findPotentialMoves(points, player, diceValue, { left: 0, right: 0 });
      expect({ '1': [17], '6': [1], '16': [21], '17': [22], '19': [24] }).toEqual(result);
    })

    it('should not allow bearing off at point 10 when there are valid moves before this one', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));

      points[6] = { id: 7, checkers: 5, player: PLAYER.RIGHT }
      points[7] = { id: 8, checkers: 5, player: PLAYER.RIGHT }
      points[8] = { id: 9, checkers: 2, player: PLAYER.RIGHT }
      points[9] = { id: 10, checkers: 2, player: PLAYER.RIGHT }
      points[10] = { id: 11, checkers: 1, player: PLAYER.RIGHT }
      points[18] = { id: 19, checkers: 5, player: PLAYER.LEFT }
      points[19] = { id: 20, checkers: 3, player: PLAYER.LEFT }
      points[20] = { id: 21, checkers: 2, player: PLAYER.LEFT }
      points[21] = { id: 22, checkers: 3, player: PLAYER.LEFT }
      points[22] = { id: 23, checkers: 1, player: PLAYER.LEFT }

      const result = findPotentialMoves(points, PLAYER.RIGHT, [4, 4, 4], { left: 0, right: 0 });
      expect(result).toEqual({ '7': [11], '8': [12], '9': [-1, -1, -1] });
    });
  });

  describe('moveCheckers', () => {
    it('should move a checker from one point to an empty spot', () => {
      const points = [
        { checkers: 5, player: PLAYER.RIGHT },
        { checkers: 0, player: null }
      ];
      const player = PLAYER.RIGHT;
      const { updatedPoints, hasBarPlayer } = moveCheckers(points, 1, 0, player);
      expect(updatedPoints[0].checkers).toBe(4);
      expect(updatedPoints[1].checkers).toBe(1);
      expect(updatedPoints[1].player).toBe(PLAYER.RIGHT);
      expect(hasBarPlayer).toBe('');
    });

    it('should remove player from a point when checkers reach 0', () => {
      const points = [
        { checkers: 1, player: PLAYER.RIGHT },
        { checkers: 0, player: null }
      ];
      const player = PLAYER.RIGHT;
      const { updatedPoints, hasBarPlayer } = moveCheckers(points, 1, 0, player);
      expect(updatedPoints[0].checkers).toBe(0);
      expect(updatedPoints[0].player).toBe(null);
      expect(updatedPoints[1].checkers).toBe(1);
      expect(updatedPoints[1].player).toBe(PLAYER.RIGHT);
      expect(hasBarPlayer).toBe('');
    });

    it('should update the checkers on the bar when the destination point belongs to the opponent', () => {
      const points = [
        { checkers: 1, player: PLAYER.RIGHT },
        { checkers: 1, player: PLAYER.LEFT }
      ];
      const player = PLAYER.RIGHT;
      const { updatedPoints, hasBarPlayer } = moveCheckers(points, 1, 0, player);
      expect(updatedPoints[0]).toEqual({ checkers: 0, player: null });
      expect(updatedPoints[1]).toEqual({ checkers: 1, player: PLAYER.RIGHT });
      expect(hasBarPlayer).toBe(PLAYER.LEFT);
    });

    it('should not update the checkers on the bar when the destination point belongs to the same player', () => {
      const points = [
        { checkers: 5, player: PLAYER.LEFT },
        { checkers: 1, player: PLAYER.LEFT }
      ];
      const player = PLAYER.LEFT;
      const { updatedPoints, hasBarPlayer } = moveCheckers(points, 1, 0, player);
      expect(updatedPoints[0].checkers).toBe(4);
      expect(updatedPoints[1].checkers).toBe(2);
      expect(hasBarPlayer).toBe('');
    });
  });
});

describe('Bearing Off Logic', () => {
  it('should allow bearing off when there are three moves left and the role is high', () => {
    const points = Array.from({ length: 24 }, (_, i) => {
      const id = i + 1;
      let checkers = 0;
      let player = null;
      return { id, checkers, player };
    })

    points[22] = { id: 23, checkers: 2, player: PLAYER.LEFT }
    points[23] = { id: 24, checkers: 1, player: PLAYER.LEFT }
    points[10] = { id: 11, checkers: 1, player: PLAYER.RIGHT }
    points[11] = { id: 12, checkers: 2, player: PLAYER.RIGHT }

    const canBearOffResult = canBearOff(points, PLAYER.LEFT, { left: 0, right: 0 });
    expect(canBearOffResult).toBe(true);

    const bearOffResult = moveCheckers(points, -1, 22, PLAYER.LEFT);
    expect(bearOffResult.updatedPoints[22].checkers).toBe(1);
    expect(bearOffResult.updatedPoints[23].checkers).toBe(1);
  });

  describe('canBearOff', () => {
    it('should allow left player to bear off when all checkers in home board (points 19-24)', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));

      points[18] = { id: 19, checkers: 5, player: PLAYER.LEFT };
      points[19] = { id: 20, checkers: 5, player: PLAYER.LEFT };
      points[20] = { id: 21, checkers: 5, player: PLAYER.LEFT };

      expect(canBearOff(points, PLAYER.LEFT, { left: 0, right: 0 })).toBe(true);
    });

    it('should allow right player to bear off when all checkers in home board (points 7-12)', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));

      points[6] = { id: 7, checkers: 5, player: PLAYER.RIGHT };
      points[7] = { id: 8, checkers: 5, player: PLAYER.RIGHT };
      points[8] = { id: 9, checkers: 5, player: PLAYER.RIGHT };

      expect(canBearOff(points, PLAYER.RIGHT, { left: 0, right: 0 })).toBe(true);
    });

    it('should not allow bearing off when checkers are on bar', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));

      points[0] = { id: 1, checkers: 5, player: PLAYER.LEFT };

      expect(canBearOff(points, PLAYER.LEFT, { left: 1, right: 0 })).toBe(false);
    });

    it('should not allow bearing off when checkers outside home board', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));

      // Left player has checker outside home board
      points[0] = { id: 1, checkers: 5, player: PLAYER.LEFT };
      points[6] = { id: 7, checkers: 1, player: PLAYER.LEFT }; // Outside home board

      expect(canBearOff(points, PLAYER.LEFT, { left: 0, right: 0 })).toBe(false);
    });
  });

  describe('calculatePotentialMove bearing off', () => {
    it('should return -2 when move goes beyond board for left player', () => {
      const result = calculatePotentialMove(PLAYER.LEFT, 0, 13); // Point 1, die 13
      expect(result).toBe(-2);
    });

    it('should return -2 when move goes beyond board for right player', () => {
      const result = calculatePotentialMove(PLAYER.RIGHT, 23, 24); // Point 24, die 24
      expect(result).toBe(-2);
    });

    it('should return valid point for normal moves', () => {
      const result = calculatePotentialMove(PLAYER.LEFT, 0, 3); // Point 1, die 3
      expect(result).toBe(14); // Should be a valid poin
    });
  });

  describe('findPotentialMoves bearing off', () => {
    it('should include bearing off moves for left player in home board', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));

      points[18] = { id: 19, checkers: 2, player: PLAYER.LEFT };
      points[19] = { id: 20, checkers: 3, player: PLAYER.LEFT };
      points[22] = { id: 23, checkers: 1, player: PLAYER.LEFT };

      const result = findPotentialMoves(points, PLAYER.LEFT, [6, 5], { left: 0, right: 0 });

      expect(result[19]).toContain(-1); // Can bear off from point 19
      expect(result[20]).toContain(-1); // Can bear off from point 20
    });

    it('should include bearing off moves for right player in home board', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));

      points[10] = { id: 11, checkers: 2, player: PLAYER.RIGHT };
      points[11] = { id: 12, checkers: 3, player: PLAYER.RIGHT };

      const result = findPotentialMoves(points, PLAYER.RIGHT, [1, 2], { left: 0, right: 0 });

      expect(result[11]).toContain(-1); // Can bear off from point 11
      expect(result[12]).toContain(-1); // Can bear off from point 12
    });

    it('should not include bearing off when not all checkers in home board', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));

      points[18] = { id: 19, checkers: 2, player: PLAYER.LEFT };
      points[6] = { id: 7, checkers: 1, player: PLAYER.LEFT };

      const result = findPotentialMoves(points, PLAYER.LEFT, [6], { left: 0, right: 0 });

      // findPotentialMoves returns undefined for point 19,
      // meaning no bearing off moves are available from that point.
      expect(result[19]).toBeUndefined();
    });
  });

  describe('validateBearOffMove', () => {
    const mockPoints = Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      checkers: 0,
      player: null
    }));

    it('should validate left player bears off from point 21 with dice 4', () => {
      const result = validateBearOffMove(PLAYER.LEFT, 21, [4], mockPoints);
      expect(result.isValid).toBe(true);
      expect(result.usedDiceValue).toBe(4);
    });

    it('should NOT validate right player bears off from point 4 (outside home board)', () => {
      const result = validateBearOffMove(PLAYER.RIGHT, 4, [4], mockPoints);
      expect(result.isValid).toBe(false);
    });

    it('should validate left player bears off from point 23 with dice 2', () => {
      const result = validateBearOffMove(PLAYER.LEFT, 23, [2], mockPoints);
      expect(result.isValid).toBe(true);
      expect(result.usedDiceValue).toBe(2);
    });

    it('should validate right player bears off from point 7 with dice 6', () => {
      const result = validateBearOffMove(PLAYER.RIGHT, 7, [6], mockPoints);
      expect(result.isValid).toBe(true);
      expect(result.usedDiceValue).toBe(6);
    });

    it('should NOT validate right player bears off from point 7 with dice 1 (needs higher dice rule)', () => {
      const result = validateBearOffMove(PLAYER.RIGHT, 7, [1], mockPoints);
      expect(result.isValid).toBe(false);
    });
  });
});
