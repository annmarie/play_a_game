/* globals describe, expect, it */
import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';
import { rollDie, togglePlayer } from './gameLogic';

describe('Game Logic', () => {
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
});