import { PLAYER } from '../globals';
import { rollDie, togglePlayer, selectSpotLogic } from './index';

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
      expect(togglePlayer(PLAYER.RIGHT)).toBe(PLAYER.LEFT);
    });

    it('should toggle from PLAYER_LEFT to PLAYER_RIGHT', () => {
      expect(togglePlayer(PLAYER.LEFT)).toBe(PLAYER.RIGHT);
    });
  });

  describe('selectSpotLogic', () => {
    const mockState = {
      player: PLAYER.LEFT,
      diceValue: [3, 4],
      checkersOnBar: { [PLAYER.LEFT]: 0, [PLAYER.RIGHT]: 0 },
      points: Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        checkers: 0,
        player: null
      })),
      potentialMoves: {}
    };

    beforeEach(() => {
      mockState.points[0] = { id: 1, checkers: 2, player: PLAYER.LEFT };
      mockState.potentialMoves = { 1: [4, 5] };
    });

    it('returns null when no player', () => {
      const state = { ...mockState, player: null };
      expect(selectSpotLogic(state, 1)).toBeNull();
    });

    it('returns null when no dice value', () => {
      const state = { ...mockState, diceValue: null };
      expect(selectSpotLogic(state, 1)).toBeNull();
    });

    it('returns null when empty dice array', () => {
      const state = { ...mockState, diceValue: [] };
      expect(selectSpotLogic(state, 1)).toBeNull();
    });

    it('handles checker on bar move', () => {
      const state = {
        ...mockState,
        checkersOnBar: { [PLAYER.LEFT]: 1, [PLAYER.RIGHT]: 0 },
        potentialMoves: { 22: [] }
      };

      const result = selectSpotLogic(state, 22);
      expect(result).toEqual({
        type: 'move',
        fromIndex: -1,
        selectedIndex: 21,
        moveDistance: -9
      });
    });

    it('returns null for invalid bar move', () => {
      const state = {
        ...mockState,
        checkersOnBar: { [PLAYER.LEFT]: 1, [PLAYER.RIGHT]: 0 },
        potentialMoves: {}
      };

      expect(selectSpotLogic(state, 22)).toBeNull();
    });

    it('returns null for invalid point selection', () => {
      expect(selectSpotLogic(mockState, 0)).toBeNull();
    });

    it('returns null when point has no checkers', () => {
      mockState.points[1] = { id: 2, checkers: 0, player: null };
      expect(selectSpotLogic(mockState, 2)).toBeNull();
    });

    it('returns null when point belongs to opponent', () => {
      mockState.points[1] = { id: 2, checkers: 2, player: PLAYER.RIGHT };
      expect(selectSpotLogic(mockState, 2)).toBeNull();
    });

    it('returns selection result for valid point', () => {
      const result = selectSpotLogic(mockState, 1);
      expect(result).toEqual({
        type: 'select',
        selectedSpot: 1,
        potentialSpots: [4, 5]
      });
    });

    it('returns empty potential spots when no moves available', () => {
      const state = { ...mockState, potentialMoves: {} };
      const result = selectSpotLogic(state, 1);
      expect(result).toEqual({
        type: 'select',
        selectedSpot: 1,
        potentialSpots: []
      });
    });
  });
});
