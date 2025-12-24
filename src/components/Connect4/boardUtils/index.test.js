import { dropChecker, isBoardFull, checkWin, initializeBoard } from '.';
import { PLAYER } from '../globals';

describe('initializeBoard', () => {
  it('should create a 6x7 board filled with null values', () => {
    const board = initializeBoard();
    expect(board).toHaveLength(6);
    expect(board[0]).toHaveLength(7);
    expect(board.every(row => row.every(cell => cell === null))).toBe(true);
  });
});

describe('dropChecker', () => {
  it('should drop a checker into the correct column and return the updated board', () => {
    const board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    const { currentMove, newBoard } = dropChecker(1, board, PLAYER.ONE);

    expect(currentMove).toEqual({ row: 2, col: 1 });
    expect(newBoard[2][1]).toBe(PLAYER.ONE);
  });

  it('should not overwrite an already filled column', () => {
    const board = [
      [null, null, null],
      [null, PLAYER.ONE, null],
      [null, PLAYER.ONE, null],
    ];
    const { currentMove, newBoard } = dropChecker(1, board, PLAYER.TWO);

    expect(currentMove).toEqual({ row: 0, col: 1 });
    expect(newBoard[0][1]).toBe(PLAYER.TWO);
  });

  it('should return null for currentMove if the column is full', () => {
    const board = [
      [PLAYER.ONE, null, null],
      [PLAYER.ONE, null, null],
      [PLAYER.ONE, null, null],
    ];
    const { currentMove } = dropChecker(0, board, PLAYER.TWO);

    expect(currentMove).toBeNull();
  });
});

describe('isBoardFull', () => {
  it('should return true if the board is completely filled', () => {
    const board = [
      [PLAYER.ONE, PLAYER.TWO, PLAYER.ONE],
      [PLAYER.TWO, PLAYER.ONE, PLAYER.TWO],
      [PLAYER.ONE, PLAYER.TWO, PLAYER.ONE],
    ];
    expect(isBoardFull(board)).toBe(true);
  });

  it('should return false if there are empty cells on the board', () => {
    const board = [
      [PLAYER.ONE, PLAYER.TWO, null],
      [PLAYER.TWO, PLAYER.ONE, PLAYER.TWO],
      [PLAYER.ONE, PLAYER.TWO, PLAYER.ONE],
    ];
    expect(isBoardFull(board)).toBe(false);
  });
});

describe('checkWin', () => {
  it('should detect a horizontal win', () => {
    const board = [
      [null, null, null, null],
      [null, null, null, null],
      [PLAYER.ONE, PLAYER.ONE, PLAYER.ONE, PLAYER.ONE],
      [null, null, null, null],
    ];
    const move = { row: 2, col: 0 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'horizontal' });
  });

  it('should detect a vertical win', () => {
    const board = [
      [null, null, PLAYER.ONE],
      [null, null, PLAYER.ONE],
      [null, null, PLAYER.ONE],
      [null, null, PLAYER.ONE],
    ];
    const move = { row: 0, col: 2 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'vertical' });
  });

  it('should detect a diagonal win (top-left to bottom-right)', () => {
    const board = [
      [PLAYER.ONE, null, null, null],
      [null, PLAYER.ONE, null, null],
      [null, null, PLAYER.ONE, null],
      [null, null, null, PLAYER.ONE],
    ];
    const move = { row: 0, col: 0 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'diagonal' });
  });

  it('should detect a diagonal win (top-right to bottom-left)', () => {
    const board = [
      [null, null, null, PLAYER.ONE],
      [null, null, PLAYER.ONE, null],
      [null, PLAYER.ONE, null, null],
      [PLAYER.ONE, null, null, null],
    ];
    const move = { row: 0, col: 3 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'diagonal' });
  });

  it('should return no winner if no win condition is met', () => {
    const board = [
      [null, null, null, null],
      [null, null, null, null],
      [PLAYER.ONE, PLAYER.TWO, PLAYER.ONE, PLAYER.TWO],
      [null, null, null, null],
    ];
    const move = { row: 2, col: 0 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: false, desc: '' });
  });

  it('should prioritize diagonal win over horizontal or vertical win', () => {
    const board = [
      [PLAYER.ONE, null, null, null],
      [PLAYER.ONE, PLAYER.ONE, PLAYER.TWO, null],
      [PLAYER.ONE, PLAYER.ONE, PLAYER.ONE, PLAYER.TWO],
      [PLAYER.ONE, PLAYER.TWO, PLAYER.ONE, PLAYER.ONE],
    ];
    const move = { row: 0, col: 0 };

    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'diagonal' });
  });
});
