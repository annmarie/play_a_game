import {
  sendMultiplayerMove,
  shouldShowGame
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
});
