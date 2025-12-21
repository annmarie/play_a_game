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
      const { roomId, isHost } = action.payload;
      state.roomId = roomId;
      state.isHost = isHost;
      state.gameMode = 'multiplayer';
    },
    setOpponent: (state, action) => {
      state.opponent = action.payload;
    },
    leaveRoom: (state) => {
      state.roomId = null;
      state.isHost = false;
      state.opponent = null;
      state.gameMode = 'local';
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
