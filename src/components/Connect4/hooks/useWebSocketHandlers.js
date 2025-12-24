import { makeMultiplayerMove, syncGameState, setMultiplayerMode } from '../slice';
import { PLAYER } from '../globals';
import { useWebSocketHandlers as useSharedWebSocketHandlers } from '@/hooks/useWebSocketHandlers';

export const useWebSocketHandlers = () => {
  return useSharedWebSocketHandlers('connect4', {
    makeMultiplayerMove,
    syncGameState,
    setMultiplayerMode
  }, {
    FIRST: PLAYER.ONE,
    SECOND: PLAYER.TWO
  });
};
