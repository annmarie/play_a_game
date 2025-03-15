import { createSlice } from '@reduxjs/toolkit';
import {
  initializeBoard, hasWinningMove, hasMovesLeft,
  jumpPeg, validateJump
} from './utils';

export const initialState = {
  board: initializeBoard(),
  selectedPeg: null,
  winner: false,
  movesLeft: true,
  history: [],
};

export const slice = createSlice({
  name: 'pegsolitaire',
  initialState,
  reducers: {
    selectPeg: (state, action) => reduceSelectPeg(state, action),
    makeMove: (state, action) => reduceMakeMove(state, action),
    undoMove: (state) => reduceUndoMove(state),
    resetGame: () => ({ ...initialState, board: initializeBoard() }),
  },
});

const reduceSelectPeg = (state, action) => {
  const { row, col } = action.payload;
  if (state.board[row][col] !== 1) return state;
  return { ...state, selectedPeg: action.payload };
};

const reduceMakeMove = (state, action) => {
  if (state.winner || !state.selectedPeg) return state;

  const { endRow, endCol } = action.payload;
  const { row: startRow, col: startCol } = state.selectedPeg;

  if (!validateJump(state.board, startRow, startCol, endRow, endCol)) return state;

  const newBoard = jumpPeg(state.board, startRow, startCol, endRow, endCol, state.board);

  const winner = hasWinningMove(newBoard);
  const movesLeft = winner ? false : hasMovesLeft(newBoard);

  return {
    ...state,
    board: newBoard,
    winner,
    movesLeft,
    selectedPeg: null,
    history: [...state.history, state.board],
  };
};

const reduceUndoMove = (state) => {
  if (state.history.length === 0 || state.winner) return state;

  const previousBoard = state.history[state.history.length - 1];

  return {
    ...state,
    board: previousBoard,
    winner: hasWinningMove(previousBoard),
    movesLeft: hasMovesLeft(previousBoard),
    selectedPeg: null,
    history: state.history.slice(0, -1),
  };
};


export const { selectPeg, makeMove, resetGame, undoMove } = slice.actions;

export default slice.reducer;
