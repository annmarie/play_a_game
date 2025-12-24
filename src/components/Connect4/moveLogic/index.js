/**
 * Validates if a column move is valid
 * @param {number} col - The column index
 * @param {Array} board - The current game board
 * @returns {Object} Validation result with isValid boolean and error message
 */
export const isValidColumn = (col, board) => {
  if (!board || !board.length) {
    return { isValid: false, error: 'Invalid board' };
  }

  if (col < 0 || col >= board[0]?.length) {
    return { isValid: false, error: 'Invalid column' };
  }

  // Check if column is full (top row is occupied)
  if (board[0][col] !== null) {
    return { isValid: false, error: 'Column is full' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates if a move can be made in the current game state
 * @param {Object} state - Current game state
 * @param {number} col - Column to validate
 * @returns {Object} Validation result
 */
export const isValidMove = (state, col) => {
  if (state.winner) {
    return { isValid: false, error: 'Game already has a winner' };
  }

  // Only check turn in multiplayer mode
  if (state.isMultiplayer && !state.isMyTurn) {
    return { isValid: false, error: 'Not your turn' };
  }

  return isValidColumn(col, state.board);
};
