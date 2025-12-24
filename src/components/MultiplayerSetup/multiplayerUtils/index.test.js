import {
  sendMultiplayerMove,
  shouldShowGame,
  setMultiplayerModeReducer,
  makeMultiplayerMoveReducer,
  syncGameStateReducer
} from './index';
import { wsService } from '@services/websocket';

jest.mock('@services/websocket');

describe('multiplayerUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMultiplayerMove', () => {
    it('should send move when authenticated', () => {
      wsService.csrfClient = { authenticated: true };
      const result = sendMultiplayerMove('connect4', { player: 'X' });

      expect(wsService.send).toHaveBeenCalledWith('gameMove', {
        gameType: 'connect4',
        gameState: { player: 'X' }
      });
      expect(result).toBe(true);
    });

    it('should return false when not authenticated', () => {
      wsService.csrfClient = { authenticated: false };
      const result = sendMultiplayerMove('connect4', { player: 'X' });

      expect(wsService.send).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('shouldShowGame', () => {
    it('should show game in single player mode', () => {
      expect(shouldShowGame(false, null, null)).toBe(true);
    });

    it('should show game in multiplayer when room and opponent exist', () => {
      expect(shouldShowGame(true, 'room123', 'opponent')).toBe('opponent');
    });

    it('should hide game in multiplayer without room', () => {
      expect(shouldShowGame(true, null, 'opponent')).toBe(null);
    });
  });

  describe('makeMultiplayerMoveReducer', () => {
    it('should handle connect4 auto-switch turn logic correctly', () => {
      const state = {
        isMultiplayer: true,
        myPlayer: 'X',
        player: 'X'
      };
      const action = {
        type: 'connect4/makeMultiplayerMove',
        payload: { player: 'O', board: [[]] }
      };

      const result = makeMultiplayerMoveReducer(state, action);

      expect(result.isMyTurn).toBe(false); // Not my turn since next player is O
      expect(result.player).toBe('O');
    });

    it('should set turn correctly when it becomes my turn', () => {
      const state = {
        isMultiplayer: true,
        myPlayer: 'X',
        player: 'O'
      };
      const action = {
        type: 'connect4/makeMultiplayerMove',
        payload: { player: 'X', board: [[]] }
      };

      const result = makeMultiplayerMoveReducer(state, action);

      expect(result.isMyTurn).toBe(true); // My turn since next player is X
      expect(result.player).toBe('X');
    });

    it('should always allows turns in single player mode', () => {
      const state = {
        isMultiplayer: false,
        myPlayer: 'X',
        player: 'X'
      };
      const action = {
        type: 'connect4/makeMultiplayerMove',
        payload: { player: 'O', board: [[]] }
      };

      const result = makeMultiplayerMoveReducer(state, action);

      expect(result.isMyTurn).toBe(true);
    });
  });

  describe('setMultiplayerModeReducer', () => {
    it('should set multiplayer mode and player correctly', () => {
      const state = { player: 'X', isMyTurn: false };
      const action = {
        payload: { isMultiplayer: true, myPlayer: 'O' }
      };

      const result = setMultiplayerModeReducer(state, action);

      expect(result.isMultiplayer).toBe(true);
      expect(result.myPlayer).toBe('O');
      expect(result.isMyTurn).toBe(false); // Not my turn since I'm O but current player is X
    });

    it('should return unchanged state for invalid payload', () => {
      const state = { player: 'X' };
      const action = { payload: { isMultiplayer: 'invalid' } };

      const result = setMultiplayerModeReducer(state, action);

      expect(result).toBe(state);
    });
  });

  describe('syncGameStateReducer', () => {
    it('should sync game state and sets turn correctly', () => {
      const state = {
        isMultiplayer: true,
        myPlayer: 'X',
        oldData: 'preserved'
      };
      const action = {
        payload: { player: 'X', board: [[]], newData: 'updated' }
      };

      const result = syncGameStateReducer(state, action);

      expect(result.player).toBe('X');
      expect(result.board).toEqual([[]]);
      expect(result.newData).toBe('updated');
      expect(result.oldData).toBe('preserved');
      expect(result.isMyTurn).toBe(true); // My turn since synced player is X
    });
  });
});
