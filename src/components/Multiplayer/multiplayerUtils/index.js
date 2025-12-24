import { wsService } from '@services/websocket';

export const sendMultiplayerMove = (gameType, gameState) => {
  if (!gameType || !gameState) return false;

  try {
    if (wsService?.csrfClient?.authenticated) {
      wsService.send('gameMove', { gameType, gameState });
      return true;
    }
  } catch (error) {
    console.error('Failed to send multiplayer move:', error);
  }
  return false;
};

export const shouldShowGame = (isMultiplayer, roomId, opponent) => {
  return isMultiplayer === false || (roomId && opponent);
};

export const shouldShowMultiplayerSetup = (isMultiplayer, opponent) => {
  return isMultiplayer === null || (isMultiplayer === true && !opponent);
};

export const setMultiplayerModeReducer = (state, action) => {
  const { isMultiplayer, myPlayer } = action.payload || {};
  if (typeof isMultiplayer !== 'boolean') return state;

  return {
    ...state,
    isMultiplayer,
    myPlayer,
  };
};

export const makeMultiplayerMoveReducer = (state, action) => {
  const gameState = action.payload;
  if (!gameState) return state;

  return {
    ...state,
    ...gameState,
  };
};

export const syncGameStateReducer = (state, action) => {
  const syncedState = action.payload;
  if (!syncedState) return state;

  return {
    ...state,
    ...syncedState,
  };
};
