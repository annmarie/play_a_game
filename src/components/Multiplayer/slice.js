import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  isConnected: false,
  playerId: null,
  playerName: '',
  connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected'
  error: null,
  rooms: {}, // { gameType: { roomId, isHost, opponent } }
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
      state.rooms[gameType] = { roomId, isHost, opponent: null };
    },
    setOpponent: (state, action) => {
      const { gameType, opponent } = action.payload;
      if (state.rooms[gameType]) {
        state.rooms[gameType].opponent = opponent;
      }
    },
    leaveRoom: (state, action) => {
      const { gameType } = action.payload;
      delete state.rooms[gameType];
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
