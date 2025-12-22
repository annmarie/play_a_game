import { makeMultiplayerMove, syncGameState, setMultiplayerMode } from '../slice';
import { PLAYERS } from '../globals';
import { useWebSocketHandlers as useSharedWebSocketHandlers } from '@/hooks/useWebSocketHandlers';

export const useWebSocketHandlers = () => {
  const gameActions = {
    makeMultiplayerMove,
    syncGameState,
    setMultiplayerMode
  };

  const playerConstants = {
    FIRST: PLAYERS.ONE,
    SECOND: PLAYERS.TWO
  };

  return useSharedWebSocketHandlers(gameActions, playerConstants, 'connect4');
};
