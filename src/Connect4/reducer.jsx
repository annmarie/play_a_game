import { MAKE_MOVE, UNDO_MOVE, RESET_GAME } from './actionTypes';
import { PLAYER_ONE } from './globals';
import { initializeBoard, dropChecker, checkWin, isBoardFull, togglePlayer } from './utils'

export const initialState = {
  board: initializeBoard(),
  player: PLAYER_ONE,
  winner: null,
  winnerDesc: '',
  boardFull: false,
  history: [],
};

export const reducer = (state, action) => {
  switch (action.type) {
    case MAKE_MOVE:
      return reduceMakeMove(state, action);
    case UNDO_MOVE:
      return reduceUndoMove(state);
    case RESET_GAME:
      return { ...initialState, board: initializeBoard() }
    default:
      return state || initialState;
  }
};

const reduceMakeMove = (state, action) => {
  const { col } = action.payload;
  if (state.winner) return state;
  const { board, player } = state;
  const { currentMove, newBoard } = dropChecker(col, board, player);
  if (!currentMove) return state;
  const { haveWinner, desc } = checkWin(newBoard, currentMove);
  const boardFull = isBoardFull(newBoard);

  return {
    ...state,
    board: newBoard,
    winner: haveWinner ? state.player : null,
    winnerDesc: haveWinner ? desc : '',
    boardFull,
    player: togglePlayer(state.player),
    history: [...state.history, state.board],
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
    history: state.history.slice(0, -1),
  };
};
