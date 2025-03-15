import { PLAYER_ONE } from './globals';
import { calculateWinner, initializeBoard, togglePlayer } from './utils';
import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  board: initializeBoard(),
  player: PLAYER_ONE,
  winner: null,
  boardFull: false,
  history: [],
};

export const slice = createSlice({
  name: 'tictactoe',
  initialState,
  reducers: {
    makeMove: (state, action) => reduceMakeMove(state, action),
    undoMove: (state) => reduceUndoMove(state),
    resetGame: () => ({ ...initialState, board: initializeBoard() })
  },
});

const reduceMakeMove = (state, action) => {
  const index = action.payload;
  if ( state.winner || state.board[index] ) return state;

  const oldBoard = [...state.board];
  const newBoard = [...state.board];
  newBoard[index] = state.player;

  return {
    ...state,
    board: newBoard,
    player: togglePlayer(state.player),
    winner: calculateWinner(newBoard),
    boardFull: newBoard.every((cell) => cell !== null),
    history: [...state.history, oldBoard],
  };
};

const reduceUndoMove = (state) => {
  if ( state.history.length === 0 || state.winner ) return state;

  return {
    ...state,
    board: state.history[state.history.length - 1],
    player: togglePlayer(state.player),
    winner: null,
    history: state.history.slice(0, -1),
  };
};

export const { makeMove, undoMove, resetGame } = slice.actions;

export default slice.reducer;
