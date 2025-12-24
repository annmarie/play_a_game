import { wsService } from '@services/websocket';

export const sendMultiplayerMove = (gameType, gameState) => {
  if (typeof wsService !== 'undefined') {
    wsService.send('gameMove', {
      gameType,
      gameState
    });
  }
};

export const shouldShowGame = (isMultiplayer, roomId, opponent) => {
  return isMultiplayer === false || (roomId && opponent);
};

export const shouldShowMultiplayerSetup = (isMultiplayer, opponent) => {
  return isMultiplayer === null || (isMultiplayer === true && !opponent);
};

export const setMultiplayerMode = (state, action) => {
  const { isMultiplayer, myPlayer } = action.payload;
  return {
    ...state,
    isMultiplayer,
    myPlayer,
    isMyTurn: isMultiplayer ? myPlayer === state.player : true
  };
};

export const makeMultiplayerMove = (state, action) => {
  const { gameState } = action.payload;
  return {
    ...state,
    ...gameState,
    isMyTurn: state.myPlayer === gameState.player
  };
};

export const syncGameState = (state, action) => {
  const syncedState = action.payload;
  return {
    ...state,
    ...syncedState,
    isMyTurn: state.isMultiplayer ? state.myPlayer === syncedState.player : true
  };
};
