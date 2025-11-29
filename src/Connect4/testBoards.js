import { PLAYER_ONE, PLAYER_TWO } from './globals';

export const testBoards = {
  nearWin: {
    name: 'Near Win',
    board: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [PLAYER_ONE, PLAYER_ONE, PLAYER_ONE, null, null, null, null],
      [PLAYER_TWO, PLAYER_TWO, PLAYER_TWO, PLAYER_TWO, null, null, null],
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_ONE, null, null, null],
    ],
    player: PLAYER_ONE,
    winner: null,
    winnerDesc: '',
    boardFull: false,
  },

  almostFull: {
    name: 'Almost Full',
    board: [
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, null],
      [PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, null],
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, null],
      [PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, null],
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, null],
      [PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, null],
    ],
    player: PLAYER_ONE,
    winner: null,
    winnerDesc: '',
    boardFull: false,
  },

  diagonalWin: {
    name: 'Diagonal Win Setup',
    board: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, PLAYER_ONE, null, null, null],
      [null, null, PLAYER_ONE, PLAYER_TWO, null, null, null],
      [null, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, null, null, null],
      [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, null, null, null],
    ],
    player: PLAYER_TWO,
    winner: PLAYER_ONE,
    winnerDesc: 'Diagonal win!',
    boardFull: false,
  },
};