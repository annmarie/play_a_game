// globals.js
export const PLAYER = {
  RIGHT: 'right',
  LEFT: 'left',
};

export const BOARD_CONFIG = {
  START_KEY_LEFT: 12,
  START_KEY_RIGHT: 24,
  MAX_HISTORY: 2,
};

export const POINT_ORDERS = {
  LEFT_PLAYER: [
    12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
    13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  ],
  RIGHT_PLAYER: [
    24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  ],
};

export const BUTTON_TEXT = {
  UNDO_MOVE: 'Undo Move',
  RESET_GAME: 'Reset Game',
  ROLL_DICE: 'Roll Dice',
  END_TURN: 'End Turn',
};

export const GAME_TEXT = {
  TITLE: 'Backgammon',
};

export const CSS_CLASSES = {
  POINT: 'point',
  LIGHT: 'light',
  DARK: 'dark',
  BOTTOM: 'bottom',
  TOP: 'top',
  SELECTED: 'selected',
  POTENTIAL: 'potential',
};

export const ARIA_LABELS = {
  POINT: (id, checkers, player) => `Point ${id} with ${checkers} ${player ? player + ' ' : ''}checkers`,
  CURRENT_PLAYER: (player) => `Current player ${player}`,
  ROLL_DICE: 'Roll Dice',
  END_TURN: 'End turn',
  UNDO_MOVE: 'Undo last move',
  DICE: (id, value) => `Dice ${id} showing ${value || 0}`,
  PLAY_AGAIN: 'Play another game',
};

export const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
};
