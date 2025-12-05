import { PLAYERS } from '../globals';

/**
 * Drops a checker into the specified column of the board.
 *
 * @param {number} col - The column index where the checker is dropped.
 * @param {Array} board - The current state of the game board.
 * @param {string} player - The current player (e.g., PLAYER_ONE or PLAYER_TWO).
 * @returns {Object} - An object containing the updated board and the move details.
 *                     { currentMove: { row, col }, newBoard: Array<Array<string|null>> }
 */
export const dropChecker = (col, board, player) => {
  if (!board || !board.length || col < 0 || col >= board[0]?.length) {
    return { currentMove: null, newBoard: board, error: 'Invalid column' };
  }
  
  const newBoard = board.map(row => [...row]); // Create a deep copy of the board
  let currentMove = null;

  // Find the lowest empty row in the specified column
  for (let row = newBoard.length - 1; row >= 0; row--) {
    if (newBoard[row] && !newBoard[row][col]) {
      newBoard[row][col] = player;
      currentMove = { row, col };
      break;
    }
  }

  // Handle case where column is full
  if (currentMove === null) {
    return { currentMove: null, newBoard: board, error: 'Column is full' };
  }

  return { currentMove, newBoard };
};

/**
 * Checks if the board is completely filled.
 *
 * @param {Array} board - The current state of the game board.
 * @returns {boolean} - True if the board is full, false otherwise.
 */
export const isBoardFull = (board) => {
  return board.every(row => row.every(cell => cell !== null));
};

/**
 * Checks if the last move resulted in a win.
 *
 * @param {Array} board - The current state of the game board.
 * @param {Object} move - The last move made, containing row and column indices.
 *                        { row: number, col: number }
 * @returns {Object} - An object indicating if there's a winner and the winning direction.
 *                     { haveWinner: boolean, desc: string }
 */
export const checkWin = (board, move) => {
  if (!move || typeof move.row !== 'number' || typeof move.col !== 'number' ||
      move.row < 0 || move.row >= board.length ||
      move.col < 0 || move.col >= board[0].length) {
    return { haveWinner: false, desc: '' };
  }
  const { row, col } = move;
  const player = board[row][col];
  const directions = [
    { x: 1, y: 1,  desc: 'diagonal' },   // Diagonal (top-left to bottom-right)
    { x: 1, y: -1, desc: 'diagonal' },   // Diagonal (top-right to bottom-left)
    { x: 0, y: 1,  desc: 'horizontal' }, // Horizontal direction
    { x: 1, y: 0,  desc: 'vertical' },   // Vertical direction
  ];

  /**
   * Helper function to check if a spot is valid and belongs to the current player.
   *
   * @param {number} r - Row index.
   * @param {number} c - Column index.
   * @returns {boolean} - True if the spot is valid and belongs to the player, false otherwise.
   */
  const checkSpot = (r, c) => {
    return (
      r >= 0 && r < board.length &&
      c >= 0 && c < board[0].length &&
      board[r][c] === player
    );
  };

  /**
   * Counts consecutive checkers in a specific direction.
   *
   * @param {number} x - Row increment.
   * @param {number} y - Column increment.
   * @returns {number} - The total count of consecutive checkers in both directions.
   */
  const countInDirection = (x, y) => {
    let count = 0;
    let r = row, c = col;

    // Count in the positive direction
    while (checkSpot(r, c)) {
      count++;
      r += x;
      c += y;
    }

    // Count in the negative direction
    r = row - x;
    c = col - y;
    while (checkSpot(r, c)) {
      count++;
      r -= x;
      c -= y;
    }

    return count;
  };

  // Check all directions for a win
  for (const { x, y, desc } of directions) {
    if (countInDirection(x, y) >= 4) {
      return { haveWinner: true, desc };
    }
  }

  return { haveWinner: false, desc: '' };
};

/**
 * Toggles the current player
 * @param {string} player - Current player (PLAYER_ONE or PLAYER_TWO)
 * @returns {string} The opposite player
 */
export const togglePlayer = (player) => {
  return player === PLAYERS.ONE ? PLAYERS.TWO : PLAYERS.ONE;
};

/**
 * Initializes an empty game board
 * @returns {Array} A 6x7 game board filled with null values
 */
export const initializeBoard = () => Array.from({ length: 6 }, () => Array(7).fill(null));

/**
 * Handles move logic for Connect4
 * @param {Object} state - Current game state
 * @param {number} col - Column to drop checker
 * @returns {Object|null} Move result or null if invalid
 */
export const makeMoveLogic = (state, col) => {
  if (state.winner || (state.isMultiplayer && !state.isMyTurn)) {
    return null;
  }

  const { board, player } = state;
  const { currentMove, newBoard, error } = dropChecker(col, board, player);

  if (!currentMove) {
    return { error };
  }

  const { haveWinner, desc } = checkWin(newBoard, currentMove);
  const boardFull = isBoardFull(newBoard);
  const nextPlayer = togglePlayer(player);

  return {
    board: newBoard,
    currentMove,
    winner: haveWinner ? player : null,
    winnerDesc: haveWinner ? desc : '',
    boardFull,
    player: nextPlayer,
    haveWinner
  };
};


