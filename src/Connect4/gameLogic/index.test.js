import { dropChecker, isBoardFull, checkWin, togglePlayer } from '.';
import { PLAYER_ONE, PLAYER_TWO } from '../globals';

describe('dropChecker', () => {
  it('should drop a checker into the correct column and return the updated board', () => {
    const board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    const { currentMove, newBoard } = dropChecker(1, board, PLAYER_ONE);

    expect(currentMove).toEqual({ row: 2, col: 1 });
    expect(newBoard[2][1]).toBe(PLAYER_ONE);
  });

  it('should not overwrite an already filled column', () => {
    const board = [
      [null, null, null],
      [null, PLAYER_ONE, null],
      [null, PLAYER_ONE, null],
    ];
    const { currentMove, newBoard } = dropChecker(1, board, PLAYER_TWO);

    expect(currentMove).toEqual({ row: 0, col: 1 });
    expect(newBoard[0][1]).toBe(PLAYER_TWO);
  });

  it('should return null for currentMove if the column is full', () => {
    const board = [
      [PLAYER_ONE, null, null],
      [PLAYER_ONE, null, null],
      [PLAYER_ONE, null, null],
    ];
    const { currentMove } = dropChecker(0, board, PLAYER_TWO);

    expect(currentMove).toBeNull();
  });
});

describe('isBoardFull', () => {
  it('should return true if the board is completely filled', () => {
    const board = [
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE],
      [PLAYER_TWO, PLAYER_ONE, PLAYER_TWO],
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE],
    ];
    expect(isBoardFull(board)).toBe(true);
  });

  it('should return false if there are empty cells on the board', () => {
    const board = [
      [PLAYER_ONE, PLAYER_TWO, null],
      [PLAYER_TWO, PLAYER_ONE, PLAYER_TWO],
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE],
    ];
    expect(isBoardFull(board)).toBe(false);
  });
});

describe('checkWin', () => {
  it('should detect a horizontal win', () => {
    const board = [
      [null, null, null, null],
      [null, null, null, null],
      [PLAYER_ONE, PLAYER_ONE, PLAYER_ONE, PLAYER_ONE],
      [null, null, null, null],
    ];
    const move = { row: 2, col: 0 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'horizontal' });
  });

  it('should detect a vertical win', () => {
    const board = [
      [null, null, PLAYER_ONE],
      [null, null, PLAYER_ONE],
      [null, null, PLAYER_ONE],
      [null, null, PLAYER_ONE],
    ];
    const move = { row: 0, col: 2 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'vertical' });
  });

  it('should detect a diagonal win (top-left to bottom-right)', () => {
    const board = [
      [PLAYER_ONE, null, null, null],
      [null, PLAYER_ONE, null, null],
      [null, null, PLAYER_ONE, null],
      [null, null, null, PLAYER_ONE],
    ];
    const move = { row: 0, col: 0 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'diagonal' });
  });

  it('should detect a diagonal win (top-right to bottom-left)', () => {
    const board = [
      [null, null, null, PLAYER_ONE],
      [null, null, PLAYER_ONE, null],
      [null, PLAYER_ONE, null, null],
      [PLAYER_ONE, null, null, null],
    ];
    const move = { row: 0, col: 3 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'diagonal' });
  });

  it('should return no winner if no win condition is met', () => {
    const board = [
      [null, null, null, null],
      [null, null, null, null],
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO],
      [null, null, null, null],
    ];
    const move = { row: 2, col: 0 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: false, desc: '' });
  });

  it('should prioritize diagonal win over horizontal or vertical win', () => {
    const board = [
      [PLAYER_ONE, null, null, null],
      [PLAYER_ONE, PLAYER_ONE, PLAYER_TWO, null],
      [PLAYER_ONE, PLAYER_ONE, PLAYER_ONE, PLAYER_TWO],
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE],
    ];
    const move = { row: 0, col: 0 };

    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'diagonal' });
  });
});

describe('togglePlayer', () => {
  it('should toggle from PLAYER_ONE to PLAYER_TWO', () => {
    expect(togglePlayer(PLAYER_ONE)).toBe(PLAYER_TWO);
  });

  it('should toggle from PLAYER_TWO to PLAYER_ONE', () => {
    expect(togglePlayer(PLAYER_TWO)).toBe(PLAYER_ONE);
  });
});
