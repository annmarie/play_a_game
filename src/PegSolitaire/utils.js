/**
 * Checks if there is exactly one peg left on the board.
 * @param {Array} board - A 2D array representing the game board
 * @returns {boolean} - Returns true if there is exactly one peg left, otherwise false.
 */
export function hasWinningMove(board) {
  let count = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 1) {
        count++;
        if (count > 1) {
          return false;
        }
      }
    }
  }
  return count === 1;
}

/**
 * Checks if there are any valid moves left on the board.
 * @param {Array} board - A 2D array representing the game board.
 * @returns {boolean} - Returns true if there is at least one valid move left, otherwise false.
 */
export function hasMovesLeft(board) {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 1 && canJump(board, row, col)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Determines if a peg at a specific position can jump over another peg.
 * @param {Array} board - A 2D array representing the game board.
 * @param {number} row - The row index of the peg.
 * @param {number} col - The column index of the peg.
 * @returns {boolean} - Returns true if the peg can jump over another peg, otherwise false.
 */
export function canJump(board, row, col) {
  const directions = [
    [-2, 0], // Up
    [2, 0],  // Down
    [0, -2], // Left
    [0, 2],  // Right
  ];

  for (const [x, y] of directions) {
    const midRow = row + x / 2;
    const midCol = col + y / 2;
    const newRow = row + x;
    const newCol = col + y;
    if (
      newRow >= 0 && newRow < board.length &&
      newCol >= 0 && newCol < board[0].length
    ) {
      if (
        board[midRow]?.[midCol] === 1 &&
        board[newRow]?.[newCol] === 0
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Executes a jump move on the board, updating the board state.
 * @param {Array} board - A 2D array representing the game board.
 * @param {number} startRow - The starting row index of the peg.
 * @param {number} startCol - The starting column index of the peg.
 * @param {number} endRow - The ending row index after the jump.
 * @param {number} endCol - The ending column index after the jump.
 * @returns {number[][]} - A new 2D array representing the updated board state.
 */
export function jumpPeg(board, startRow, startCol, endRow, endCol) {
  const newBoard = board.map((row) => [...row]);
  newBoard[startRow][startCol] = 0;
  newBoard[endRow][endCol] = 1;
  newBoard[(startRow + endRow) / 2][(startCol + endCol) / 2] = 0;
  return newBoard;
}

/**
 * Validates if a jump move is legal based on the board state.
 * @param {Array} board - A 2D array representing the game board.
 * @param {number} startRow - The starting row index of the peg.
 * @param {number} startCol - The starting column index of the peg.
 * @param {number} endRow - The ending row index after the jump.
 * @param {number} endCol - The ending column index after the jump.
 * @returns {boolean} - Returns true if the jump move is valid, otherwise false.
 */
export function validateJump(board, startRow, startCol, endRow, endCol) {
  const rowDiff = Math.abs(startRow - endRow);
  const colDiff = Math.abs(startCol - endCol);
  if ((rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2)) {
    const midRow = (startRow + endRow) / 2;
    const midCol = (startCol + endCol) / 2;
    return board[midRow][midCol] === 1;
  }
  return false;
}

/**
 * Initializes the game board for a peg solitaire game.
 * @returns {Array} - A 2D array representing the initial board state.
 */
export function initializeBoard() {
  return [
    [null, null, 1, 1, 1, null, null],
    [null, null, 1, 1, 1, null, null],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [null, null, 1, 1, 1, null, null],
    [null, null, 1, 1, 1, null, null],
  ];
}
