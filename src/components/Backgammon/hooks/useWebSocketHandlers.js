import { PLAYERS } from '../globals';
import { makeMultiplayerMove, syncGameState, setMultiplayerMode, startGame } from '../slice';
import { useWebSocketHandlers as useSharedWebSocketHandlers } from '@/hooks/useWebSocketHandlers';

export const useWebSocketHandlers = () => {
  return useSharedWebSocketHandlers('backgammon', {
    makeMultiplayerMove,
    syncGameState,
    setMultiplayerMode,
    startGame
  }, {
    FIRST: PLAYERS.LEFT,
    SECOND: PLAYERS.RIGHT
  });
};
