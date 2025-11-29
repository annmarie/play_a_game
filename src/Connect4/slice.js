import { createSlice } from '@reduxjs/toolkit';
import {
  initializeBoard, dropChecker, checkWin, isBoardFull,
  togglePlayer, encodeBoardState, decodeBoardState
} from './utils';
import { PLAYER_ONE, MAX_HISTORY } from './globals';

export const initialState = {
  board: initializeBoard(),
  player: PLAYER_ONE,
  winner: null,
  winnerDesc: '',
  boardFull: false,
  history: [],
};

export const slice = createSlice({
  name: 'connect4',
  initialState,
  reducers: {
    makeMove: (state, action) => reduceMakeMove(state, action),
    undoMove: (state, action) => reduceUndoMove(state, action),
    resetGame: () => ({ ...initialState, board: initializeBoard() }),
    loadTestBoard: (state, action) => ({
      ...state,
      ...action.payload
    }),
    loadFromURL: (state) => {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get('board');
      if (!encoded) return state;

      const boardState = decodeBoardState(encoded);
      if (!boardState) return state;

      return { ...state, ...boardState };
    },
    saveToURL: (state) => {
      const lastHistoryItem = state.history.length > 0 ? state.history[state.history.length - 1] : null;
      const history = lastHistoryItem ? [lastHistoryItem] : [];
      const dataToSave = {
        ...state,
        history
      };
      const encoded = encodeBoardState(dataToSave);
      const url = `${window.location.origin}${window.location.pathname}?board=${encoded}`;
      navigator.clipboard.writeText(url).catch((err) => {
        console.error('Failed to copy URL to clipboard:', err);
      });
      return state;
    },
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

export const { makeMove, undoMove, resetGame, loadTestBoard, loadFromURL, saveToURL } = slice.actions;

export default slice.reducer;
