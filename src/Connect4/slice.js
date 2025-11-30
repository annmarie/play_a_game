import { createSlice } from '@reduxjs/toolkit';
import { initializeBoard, dropChecker, checkWin, isBoardFull, togglePlayer } from './gameLogic';
import { PLAYER_ONE, PLAYER_TWO, MAX_HISTORY } from './globals';
import { createSaveToURL, createLoadFromURL } from '../utils/urlGameState';

export const initialState = {
  board: initializeBoard(),
  player: PLAYER_ONE,
  winner: null,
  winnerDesc: '',
  boardFull: false,
  history: [],
  gamesWon: { [PLAYER_ONE]: 0, [PLAYER_TWO]: 0 },
};

export const slice = createSlice({
  name: 'connect4',
  initialState,
  reducers: {
    makeMove: (state, action) => reduceMakeMove(state, action),
    undoMove: (state, action) => reduceUndoMove(state, action),
    resetGame: (state) => ({ ...initialState, board: initializeBoard(), gamesWon: state.gamesWon }),
    playAgain: (state) => ({ ...initialState, board: initializeBoard(), gamesWon: state.gamesWon }),
    loadTestBoard: (state, action) => {
      const { board, player, winner, winnerDesc, boardFull } = action.payload;
      return {
        ...state,
        board: board || state.board,
        player: player || state.player,
        winner: winner !== undefined ? winner : state.winner,
        winnerDesc: winnerDesc !== undefined ? winnerDesc : state.winnerDesc,
        boardFull: boardFull !== undefined ? boardFull : state.boardFull
      };
    },
    loadFromURL: createLoadFromURL(),
    saveToURL: createSaveToURL(['history']),
  },
});

const reduceMakeMove = (state, action) => {
  const { col } = action.payload;

  if (state.winner) return state;

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

  return {
    ...state,
    board: newBoard,
    winner: haveWinner ? player : null,
    winnerDesc: haveWinner ? desc : '',
    boardFull,
    player: togglePlayer(player),
    history: newHistory,
    gamesWon: updatedGamesWon,
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

export const { makeMove, undoMove, resetGame, playAgain, loadTestBoard, loadFromURL, saveToURL } = slice.actions;

export default slice.reducer;
