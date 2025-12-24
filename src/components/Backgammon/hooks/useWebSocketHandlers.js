import { PLAYER } from '../globals';
import { makeMultiplayerMove, syncGameState, setMultiplayerMode, startGame } from '../slice';
import { useWebSocketHandlers as useSharedWebSocketHandlers } from '@/hooks/useWebSocketHandlers';

export const useWebSocketHandlers = () => {
  return useSharedWebSocketHandlers('backgammon', {
    makeMultiplayerMove,
    syncGameState,
    setMultiplayerMode,
    startGame
  }, {
    FIRST: PLAYER.LEFT,
    SECOND: PLAYER.RIGHT
  });
};
