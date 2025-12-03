import { createSlice } from '@reduxjs/toolkit';
import { initializeBoard, dropChecker, checkWin, isBoardFull, togglePlayer } from './gameLogic';
import { PLAYER_ONE, PLAYER_TWO, MAX_HISTORY } from './globals';
import { wsService } from '../services/websocket';

export const initialState = {
  board: initializeBoard(),
  player: PLAYER_ONE,
  winner: null,
  winnerDesc: '',
  boardFull: false,
  history: [],
  gamesWon: { [PLAYER_ONE]: 0, [PLAYER_TWO]: 0 },
  isMultiplayer: false,
  myPlayer: null,
  isMyTurn: true,
};

export const slice = createSlice({
  name: 'connect4',
  initialState,
  reducers: {
    makeMove: (state, action) => reduceMakeMove(state, action),
    makeMultiplayerMove: (state, action) => reduceMultiplayerMove(state, action),
    syncGameState: (state, action) => {
      const { board, player, winner, winnerDesc, boardFull, history, gamesWon } = action.payload;
      return {
        ...state,
        board: board || state.board,
        player: player || state.player,
        winner: winner !== undefined ? winner : state.winner,
        winnerDesc: winnerDesc !== undefined ? winnerDesc : state.winnerDesc,
        boardFull: boardFull !== undefined ? boardFull : state.boardFull,
        history: history || state.history,
        gamesWon: gamesWon || state.gamesWon,
        isMyTurn: state.myPlayer ? player !== state.myPlayer : state.isMyTurn,
      };
    },
    setMultiplayerMode: (state, action) => {
      const { isMultiplayer, myPlayer } = action.payload;
      state.isMultiplayer = isMultiplayer;
      state.myPlayer = myPlayer;
      state.isMyTurn = myPlayer === PLAYER_ONE;
    },
    undoMove: (state, action) => reduceUndoMove(state, action),
    resetGame: (state) => ({ ...initialState, board: initializeBoard(), gamesWon: state.gamesWon }),
    playAgain: (state) => ({ ...initialState, board: initializeBoard(), gamesWon: state.gamesWon }),
  },
});

const reduceMakeMove = (state, action) => {
  const { col } = action.payload;

  if (state.winner) return state;
  if (state.isMultiplayer && !state.isMyTurn) return state;

  const { board, player } = state;
  const { currentMove, newBoard } = dropChecker(col, board, player);

  if (!currentMove) return state;

  const { haveWinner, desc } = checkWin(newBoard, currentMove);
  const boardFull = isBoardFull(newBoard);
  const updatedGamesWon = haveWinner ? { ...state.gamesWon, [player]: state.gamesWon[player] + 1 } : state.gamesWon;

  const newHistory = [...state.history, state.board];
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }

  const newState = {
    ...state,
    board: newBoard,
    winner: haveWinner ? player : null,
    winnerDesc: haveWinner ? desc : '',
    boardFull,
    player: togglePlayer(player),
    history: newHistory,
    gamesWon: updatedGamesWon,
    isMyTurn: state.isMultiplayer ? !state.isMyTurn : state.isMyTurn,
  };

  // Send move to opponent in multiplayer mode
  if (state.isMultiplayer) {
    wsService.send('gameMove', {
      gameType: 'connect4',
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
  // If there's no history or the game has a winner, undo is not allowed.
  if (state.history.length === 0 || state.winner) return state;

  const previousBoard = state.history[state.history.length - 1];

  return {
    ...state,
    board: previousBoard,
    player: togglePlayer(state.player),
    winner: null,
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
