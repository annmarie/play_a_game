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
    isMyTurn: isMultiplayer ? myPlayer === state.player : true
  };
};

export const makeMultiplayerMoveReducer = (state, action) => {
  const gameState = action.payload;
  if (!gameState) return state;

  const gameTurnFlow = {
    connect4: 'auto-switch', // Turn switches automatically after each move
    backgammon: 'explicit',  // Player explicitly ends turn
  };
  const gameType = action.type.split('/')[0];
  const turnMechanic = gameTurnFlow[gameType] || 'explicit';

  return {
    ...state,
    ...gameState,
    isMyTurn: state.isMultiplayer ?
      (turnMechanic === 'auto-switch' ?
        state.myPlayer === gameState.player :
        state.myPlayer !== gameState.player
      ) : true
  };
};

export const syncGameStateReducer = (state, action) => {
  const syncedState = action.payload;
  if (!syncedState) return state;

  return {
    ...state,
    ...syncedState,
    isMyTurn: state.isMultiplayer ? state.myPlayer === syncedState.player : true
  };
};
