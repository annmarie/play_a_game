/**
 * Connect4 reducer
 */
import { MAKE_MOVE, UNDO_MOVE, RESET_GAME } from './actionTypes';
import { PLAYER_ONE } from './globals';
import { initializeBoard, dropChecker, checkWin, isBoardFull, togglePlayer } from './utils';

/**
 * Initial state of game
 * - `board`: A 2D array representing the game board, initialized with empty cells.
 * - `player`: The current player, starting with PLAYER_ONE.
 * - `winner`: Tracks the winner of the game (null if no winner yet).
 * - `winnerDesc`: Describes the winning condition (e.g., "horizontal", "vertical").
 * - `boardFull`: Boolean indicating if the board is completely filled.
 * - `history`: Array storing previous board states for undo functionality.
 */
export const initialState = {
  board: initializeBoard(),
  player: PLAYER_ONE,
  winner: null,
  winnerDesc: '',
  boardFull: false,
  history: [],
};

/**
 * Reducer function
 * @param {Object} state - The current state of the game.
 * @param {Object} action - The action to be processed.
 * @returns {Object} - The new state after applying the action.
 */
export const reducer = (state, action) => {
  switch (action.type) {
    case MAKE_MOVE:
      return reduceMakeMove(state, action);
    case UNDO_MOVE:
      return reduceUndoMove(state);
    case RESET_GAME:
      return { ...initialState, board: initializeBoard() };
    default:
      return state || initialState;
  }
};

/**
 * Processes a move made by the current player.
 *
 * @param {Object} state - The current state of the game.
 * @param {Object} action - The action containing the column where the move is made.
 * @returns {Object} - The updated state after the move.
 */
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

/**
 * Reverts the game state to the previous move.
 *
 * @param {Object} state - The current state of the game.
 * @returns {Object} - The updated state after undoing the last move.
 */
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
