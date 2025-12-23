import { createSlice } from '@reduxjs/toolkit';
import { initializeBoard } from './boardUtils';
import { makeMoveLogic, togglePlayer } from './gameLogic';
import { PLAYERS, GAME_CONFIG } from './globals';
import { sendMultiplayerMove, createMultiplayerReducers } from '@/utils/multiplayerUtils';

export const initialState = {
  board: initializeBoard(),
  player: PLAYERS.ONE,
  winner: null,
  winnerDesc: '',
  boardFull: false,
  history: [],
  gamesWon: { [PLAYERS.ONE]: 0, [PLAYERS.TWO]: 0 },
  isMultiplayer: null,
  myPlayer: null,
  isMyTurn: true,
};

export const slice = createSlice({
  name: 'connect4',
  initialState,
  reducers: {
    makeMove: (state, action) => reduceMakeMove(state, action),
    makeMultiplayerMove: (state, action) => reduceMultiplayerMove(state, action),
    syncGameState: createMultiplayerReducers().syncGameState,
    setMultiplayerMode: createMultiplayerReducers().setMultiplayerMode,
    undoMove: (state, action) => reduceUndoMove(state, action),
    resetGame: (state) => ({ ...initialState, board: initializeBoard(), gamesWon: state.gamesWon }),
    playAgain: (state) => ({
      ...initialState,
      board: initializeBoard(),
      gamesWon: state.gamesWon,
      isMultiplayer: state.isMultiplayer,
      myPlayer: state.myPlayer,
      isMyTurn: state.myPlayer === PLAYERS.ONE
    }),
  },
});

const reduceMakeMove = (state, action) => {
  const { col } = action.payload;

  const moveResult = makeMoveLogic(state, col);
  if (!moveResult || moveResult.error) return state;

  const { board, winner, winnerDesc, boardFull, player } = moveResult;
  const updatedGamesWon = winner ? { ...state.gamesWon, [state.player]: state.gamesWon[state.player] + 1 } : state.gamesWon;

  const newHistory = [...state.history, state.board];
  if (newHistory.length > GAME_CONFIG.MAX_HISTORY) {
    newHistory.shift();
  }

  const newState = {
    ...state,
    board,
    winner,
    winnerDesc,
    boardFull,
    player,
    history: newHistory,
    gamesWon: updatedGamesWon,
    isMyTurn: state.isMultiplayer ? !state.isMyTurn : state.isMyTurn,
  };

  if (state.isMultiplayer) {
    sendMultiplayerMove('connect4', {
      move: { col },
      gameState: newState
    });
  }

  return newState;
};

const reduceMultiplayerMove = (state, action) => {
  const { gameState } = action.payload;

  // Apply the move received from opponent
  return {
    ...state,
    ...gameState,
    isMyTurn: true,
  };
};

const reduceUndoMove = (state) => {
  if (state.history.length === 0 || state.winner) return state;

  const previousBoard = state.history[state.history.length - 1];

  return {
    ...state,
    board: previousBoard,
    player: togglePlayer(state.player),
    winner: null,
    winnerDesc: '',
    boardFull: false,
    history: state.history.slice(0, -1),
  };
};

export const {
  makeMove,
  makeMultiplayerMove,
  undoMove,
  resetGame,
  playAgain,
  syncGameState,
  setMultiplayerMode
} = slice.actions;

export default slice.reducer;
