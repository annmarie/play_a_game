// globals.js
export const PLAYER = {
  ONE: 'Red',
  TWO: 'Yellow',
};

export const MESSAGES = {
  DRAW: 'It\'s a draw!',
};

export const BUTTON_TEXT = {
  UNDO: 'UNDO',
};

export const GAME_TEXT = {
  TITLE: 'Connect Four',
};

export const GAME_CONFIG = {
  MAX_HISTORY: 3,
  ROWS: 6,
  COLS: 7,
  WIN_LENGTH: 4,
};

export const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
};

export const ARIA_LABELS = {
  GAME_STATUS: 'Game Status',
  PLAY_AGAIN: 'Play another game',
  CELL: (row, col, cell) => `Spot row ${row} and col ${col} with ${cell || 'empty'}`,
  UNDO_MOVE: 'Undo Move',
};
