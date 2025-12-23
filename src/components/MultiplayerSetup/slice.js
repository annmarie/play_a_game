import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  isConnected: false,
  roomId: null,
  playerId: null,
  playerName: '',
  isHost: false,
  opponent: null,
  gameMode: 'local', // 'local' or 'multiplayer'
  connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected'
  error: null,
  currentGameType: null, // track which game created the room
};

export const slice = createSlice({
  name: 'multiplayer',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },
    setPlayerInfo: (state, action) => {
      const { playerId, playerName } = action.payload;
      state.playerId = playerId;
      state.playerName = playerName;
    },
    joinRoom: (state, action) => {
      const { roomId, isHost, gameType } = action.payload;
      state.roomId = roomId;
      state.isHost = isHost;
      state.gameMode = 'multiplayer';
      state.currentGameType = gameType;
    },
    setOpponent: (state, action) => {
      state.opponent = action.payload;
    },
    leaveRoom: (state, action) => {
      // Only clear room if leaving the current game or no gameType specified
      const { gameType } = action.payload || {};
      if (!gameType || !state.currentGameType || gameType === state.currentGameType) {
        state.roomId = null;
        state.isHost = false;
        state.opponent = null;
        state.gameMode = 'local';
        state.currentGameType = null;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setConnectionStatus,
  setPlayerInfo,
  joinRoom,
  setOpponent,
  leaveRoom,
  setError,
  clearError,
} = slice.actions;

export default slice.reducer;
