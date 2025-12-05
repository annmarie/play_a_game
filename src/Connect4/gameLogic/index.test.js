import { dropChecker, isBoardFull, checkWin, togglePlayer } from '.';
import { PLAYERS } from '../globals';

describe('dropChecker', () => {
  it('should drop a checker into the correct column and return the updated board', () => {
    const board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    const { currentMove, newBoard } = dropChecker(1, board, PLAYERS.ONE);

    expect(currentMove).toEqual({ row: 2, col: 1 });
    expect(newBoard[2][1]).toBe(PLAYERS.ONE);
  });

  it('should not overwrite an already filled column', () => {
    const board = [
      [null, null, null],
      [null, PLAYERS.ONE, null],
      [null, PLAYERS.ONE, null],
    ];
    const { currentMove, newBoard } = dropChecker(1, board, PLAYERS.TWO);

    expect(currentMove).toEqual({ row: 0, col: 1 });
    expect(newBoard[0][1]).toBe(PLAYERS.TWO);
  });

  it('should return null for currentMove if the column is full', () => {
    const board = [
      [PLAYERS.ONE, null, null],
      [PLAYERS.ONE, null, null],
      [PLAYERS.ONE, null, null],
    ];
    const { currentMove } = dropChecker(0, board, PLAYERS.TWO);

    expect(currentMove).toBeNull();
  });
});

describe('isBoardFull', () => {
  it('should return true if the board is completely filled', () => {
    const board = [
      [PLAYERS.ONE, PLAYERS.TWO, PLAYERS.ONE],
      [PLAYERS.TWO, PLAYERS.ONE, PLAYERS.TWO],
      [PLAYERS.ONE, PLAYERS.TWO, PLAYERS.ONE],
    ];
    expect(isBoardFull(board)).toBe(true);
  });

  it('should return false if there are empty cells on the board', () => {
    const board = [
      [PLAYERS.ONE, PLAYERS.TWO, null],
      [PLAYERS.TWO, PLAYERS.ONE, PLAYERS.TWO],
      [PLAYERS.ONE, PLAYERS.TWO, PLAYERS.ONE],
    ];
    expect(isBoardFull(board)).toBe(false);
  });
});

describe('checkWin', () => {
  it('should detect a horizontal win', () => {
    const board = [
      [null, null, null, null],
      [null, null, null, null],
      [PLAYERS.ONE, PLAYERS.ONE, PLAYERS.ONE, PLAYERS.ONE],
      [null, null, null, null],
    ];
    const move = { row: 2, col: 0 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'horizontal' });
  });

  it('should detect a vertical win', () => {
    const board = [
      [null, null, PLAYERS.ONE],
      [null, null, PLAYERS.ONE],
      [null, null, PLAYERS.ONE],
      [null, null, PLAYERS.ONE],
    ];
    const move = { row: 0, col: 2 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'vertical' });
  });

  it('should detect a diagonal win (top-left to bottom-right)', () => {
    const board = [
      [PLAYERS.ONE, null, null, null],
      [null, PLAYERS.ONE, null, null],
      [null, null, PLAYERS.ONE, null],
      [null, null, null, PLAYERS.ONE],
    ];
    const move = { row: 0, col: 0 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'diagonal' });
  });

  it('should detect a diagonal win (top-right to bottom-left)', () => {
    const board = [
      [null, null, null, PLAYERS.ONE],
      [null, null, PLAYERS.ONE, null],
      [null, PLAYERS.ONE, null, null],
      [PLAYERS.ONE, null, null, null],
    ];
    const move = { row: 0, col: 3 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'diagonal' });
  });

  it('should return no winner if no win condition is met', () => {
    const board = [
      [null, null, null, null],
      [null, null, null, null],
      [PLAYERS.ONE, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.TWO],
      [null, null, null, null],
    ];
    const move = { row: 2, col: 0 };
    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: false, desc: '' });
  });

  it('should prioritize diagonal win over horizontal or vertical win', () => {
    const board = [
      [PLAYERS.ONE, null, null, null],
      [PLAYERS.ONE, PLAYERS.ONE, PLAYERS.TWO, null],
      [PLAYERS.ONE, PLAYERS.ONE, PLAYERS.ONE, PLAYERS.TWO],
      [PLAYERS.ONE, PLAYERS.TWO, PLAYERS.ONE, PLAYERS.ONE],
    ];
    const move = { row: 0, col: 0 };

    const result = checkWin(board, move);

    expect(result).toEqual({ haveWinner: true, desc: 'diagonal' });
  });
});

describe('togglePlayer', () => {
  it('should toggle from PLAYER_ONE to PLAYER_TWO', () => {
    expect(togglePlayer(PLAYERS.ONE)).toBe(PLAYERS.TWO);
  });

  it('should toggle from PLAYER_TWO to PLAYER_ONE', () => {
    expect(togglePlayer(PLAYERS.TWO)).toBe(PLAYERS.ONE);
  });
});