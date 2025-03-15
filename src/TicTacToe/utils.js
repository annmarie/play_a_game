import { PLAYER_ONE, PLAYER_TWO } from './globals';

/**
 * Determines the winner
 * @param {Array} squares - An array of 9 elements representing the game board.
 * @returns {string|null} - Returns 'X' or 'O' if there is a winner, or null if there is no winner yet.
 */
export function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],            // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

/**
 * Initializes an empty board.
 * @returns {Array} - Returns an array of 9 elements, all initialized to null.
 */
export const initializeBoard = () => Array(9).fill(null);

/**
 * Toggles the current player between PLAYER_ONE and PLAYER_TWO.
 *
 * @param {string} player - The current player.
 * @returns {string} - The next player.
 */
export function togglePlayer(player) {
  return player === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}
