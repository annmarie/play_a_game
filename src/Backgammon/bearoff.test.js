/* globals describe, expect, it */
import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';
import { canBearOff, findPotentialMoves, calculatePotentialMove } from './utils';

describe('Bearing Off Logic', () => {
  describe('canBearOff', () => {
    it('should allow left player to bear off when all checkers in home board (points 19-24)', () => {
      const points = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      }));
      
      // Place all left player checkers in home board
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
      
      // Place all right player checkers in home board
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
      // Left player at point 1 (position 11) with die 13+ would go beyond board
      const result = calculatePotentialMove(PLAYER_LEFT, 0, 13); // Point 1, die 13
      expect(result).toBe(-2);
    });

    it('should return -2 when move goes beyond board for right player', () => {
      // Right player at point 24 (position 0) with die 24+ would go beyond board
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
      
      // Left player checkers in home board
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
      
      // Right player checkers in home board
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
      
      // Left player has checkers in and outside home board
      points[18] = { id: 19, checkers: 2, player: PLAYER_LEFT };
      points[6] = { id: 7, checkers: 1, player: PLAYER_LEFT }; // Outside home board
      
      const result = findPotentialMoves(points, PLAYER_LEFT, [6], { left: 0, right: 0 });
      
      expect(result[19]).toBeUndefined(); // No moves available since can't bear off
    });
  });
});