import { makeMultiplayerMove, syncGameState, setMultiplayerMode } from '../slice';
import { PLAYERS } from '../globals';
import { useWebSocketHandlers as useSharedWebSocketHandlers } from '@/hooks/useWebSocketHandlers';

export const useWebSocketHandlers = () => {
  return useSharedWebSocketHandlers('connect4', {
    makeMultiplayerMove,
    syncGameState,
    setMultiplayerMode
  }, {
    FIRST: PLAYERS.ONE,
    SECOND: PLAYERS.TWO
  });
};
