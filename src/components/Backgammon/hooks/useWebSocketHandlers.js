import { PLAYERS } from '../globals';
import { makeMultiplayerMove, syncGameState, setMultiplayerMode } from '../slice';
import { useWebSocketHandlers as useSharedWebSocketHandlers } from '@/hooks/useWebSocketHandlers';

export const useWebSocketHandlers = () => {
  const gameActions = {
    makeMultiplayerMove,
    syncGameState,
    setMultiplayerMode
  };

  const playerConstants = {
    FIRST: PLAYERS.LEFT,
    SECOND: PLAYERS.RIGHT
  };

  return useSharedWebSocketHandlers(gameActions, playerConstants, 'backgammon');
};
