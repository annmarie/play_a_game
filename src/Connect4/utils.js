import { PLAYER_ONE, PLAYER_TWO } from './globals';

export const dropChecker = (col, board, player) => {
  const newBoard = board.map(row => [ ...row ]);
  let currentMove = null;
  for (let row = newBoard.length - 1; row >= 0; row--) {
    if (!newBoard[row][col]) {
      newBoard[row][col] = player;
      currentMove = { row, col };
      break;
    }
  }
  return { currentMove, newBoard };
}

export const isBoardFull = (board) => {
  return board.every(row => row.every(cell => cell !== null));
};

export const checkWin = (board, move) => {
  const { row, col } = move;
  const player = board[row][col];
  const directions = [
    { x: 0, y: 1, desc: 'horizontal' },
    { x: 1, y: 0 , desc: 'vertical'},
    { x: 1, y: 1, desc: 'diagonal' },
    { x: 1, y: -1, desc: 'diagonal' }
  ];

  const checkSpot = (r, c) => {
    return (
      r >= 0  && r < board.length
      && c >= 0 && c < board[0].length
      && board[r][c] === player
    )
 };

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

  for (const { x, y, desc } of directions) {
    if (countInDirection(x, y) >= 4) {
      return { haveWinner: true, desc };
    }
  }

  return { haveWinner: false, desc: '' };
};

export const togglePlayer = (player) => {
  return player === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}

export const initializeBoard = () => Array.from({ length: 6 }, () => Array(7).fill(null));