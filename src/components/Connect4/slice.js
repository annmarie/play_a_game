import { createSlice } from '@reduxjs/toolkit';
import { initializeBoard } from './boardUtils';
import { makeMoveLogic, togglePlayer } from './gamePlay';
import { PLAYER, GAME_CONFIG } from './globals';
import { sendMultiplayerMove } from '@/components/Multiplayer/multiplayerUtils';

export const initialState = {
  board: initializeBoard(),
  player: PLAYER.ONE,
  winner: null,
  winnerDesc: '',
  boardFull: false,
  history: [],
  gamesWon: { [PLAYER.ONE]: 0, [PLAYER.TWO]: 0 },
  isMultiplayer: null,
  myPlayer: null,
  isMyTurn: true,
};

export const slice = createSlice({
  name: 'connect4',
  initialState,
  reducers: {
    makeMove: (state, action) => {
      const { col } = action.payload;
      const moveResult = makeMoveLogic(state, col);
      if (!moveResult || moveResult.error) return state;

      const { board, winner, winnerDesc, boardFull, player } = moveResult;
      const updatedGamesWon = winner ? { ...state.gamesWon, [state.player]: state.gamesWon[state.player] + 1 } : state.gamesWon;
      const newHistory = [...state.history, state.board];
      if (newHistory.length > GAME_CONFIG.MAX_HISTORY) newHistory.shift();

      const newState = {
        ...state,
        board,
        winner,
        winnerDesc,
        boardFull,
        player,
        history: newHistory,
        gamesWon: updatedGamesWon,
        isMyTurn: !state.isMultiplayer || state.myPlayer !== player,
      };

      if (state.isMultiplayer) {
        sendMultiplayerMove('connect4', { board, winner, winnerDesc, boardFull, player });
      }

      return newState;
    },
    syncGameState: (state, action) => {
      const { board, winner, winnerDesc, boardFull, player } = action.payload;
      return {
        ...state,
        board,
        winner,
        winnerDesc,
        boardFull,
        player,
        isMyTurn: !state.isMultiplayer || state.myPlayer === player,
      };
    },
    setMultiplayerMode: (state, action) => {
      const { isMultiplayer, myPlayer } = action.payload || {};
      if (typeof isMultiplayer !== 'boolean') return state;
      return {
        ...state,
        isMultiplayer,
        myPlayer,
        isMyTurn: !isMultiplayer || myPlayer === state.player
      };
    },
    undoMove: (state) => {
      if (state.history.length === 0 || state.winner) return state;
      return {
        ...state,
        board: state.history[state.history.length - 1],
        player: togglePlayer(state.player),
        winner: null,
        winnerDesc: '',
        boardFull: false,
        history: state.history.slice(0, -1),
      };
    },
    resetGame: (state) => ({ ...initialState, board: initializeBoard(), gamesWon: state.gamesWon }),
    playAgain: (state) => ({
      ...initialState,
      board: initializeBoard(),
      gamesWon: state.gamesWon,
      isMultiplayer: state.isMultiplayer,
      myPlayer: state.myPlayer,
      isMyTurn: !state.isMultiplayer || state.myPlayer === PLAYER.ONE
    }),
  },
});



export const {
  makeMove,
  undoMove,
  resetGame,
  playAgain,
  syncGameState,
  setMultiplayerMode
} = slice.actions;

export default slice.reducer;
