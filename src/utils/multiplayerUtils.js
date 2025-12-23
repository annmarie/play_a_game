import { wsService } from '@services/websocket';

export const sendMultiplayerMove = (gameType, gameState) => {
  if (typeof wsService !== 'undefined') {
    wsService.send('gameMove', {
      gameType,
      gameState
    });
  }
};

export const createMultiplayerReducers = () => ({
  setMultiplayerMode: (state, action) => {
    const { isMultiplayer, myPlayer } = action.payload;
    return {
      ...state,
      isMultiplayer,
      myPlayer,
      isMyTurn: isMultiplayer ? myPlayer === state.player : true
    };
  },

  makeMultiplayerMove: (state, action) => {
    const { gameState } = action.payload;
    return {
      ...state,
      ...gameState,
      isMyTurn: state.myPlayer === gameState.player
    };
  },

  syncGameState: (state, action) => {
    const syncedState = action.payload;
    return {
      ...state,
      ...syncedState,
      isMyTurn: state.isMultiplayer ? state.myPlayer === syncedState.player : true
    };
  }
});