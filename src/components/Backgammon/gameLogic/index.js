import { PLAYERS, BOARD_CONFIG } from '../globals';

/**
 * Toggles the current player
 * @param {string} player - Current player (PLAYER_LEFT or PLAYER_RIGHT)
 * @returns {string} The opposite player
 */
export const togglePlayer = (player) => {
  return player === PLAYERS.RIGHT ? PLAYERS.LEFT : PLAYERS.RIGHT;
};

/**
 * Simulates rolling a six-sided die
 * @returns {number} Random number between 1 and 6
 */
export const rollDie = () => {
  return Math.floor(Math.random() * 6) + 1;
};

/**
 * Handles dice rolling logic for backgammon game
 * @param {string|null} currentPlayer - Current player or null for game star
 * @returns {{diceValue: number[], player: string}} Object with dice values and active player
 */
export function rollDiceLogic(currentPlayer) {
  let die1 = null;
  let die2 = null;

  let rollCnt = 0;
  const rollMax = 10;
  if (currentPlayer === null) {
    while (die1 === die2 && rollCnt < rollMax) {
      die1 = rollDie();
      die2 = rollDie();
      rollCnt++;
      if (rollCnt >= rollMax) {
        console.error('Roll Error: manually setting dice');
        die1 = 1;
        die2 = 2;
      }
    }
  } else {
    die1 = rollDie();
    die2 = rollDie();
  }

  const diceValue = (die1 === die2) ? [die1, die2, die1, die2] : [die1, die2];
  const player = currentPlayer === null ? (die2 > die1 ? PLAYERS.RIGHT : PLAYERS.LEFT) : currentPlayer;

  return { diceValue, player };
}

/**
 * Checks if a player has won
 * @param {Object} checkersBorneOff - Object tracking borne off checkers for each player
 * @param {string} player - Player to check for win condition
 * @returns {string|null} Winning player or null if no winner
 */
export const checkWinner = (checkersBorneOff, player) => {
  return checkersBorneOff[player] === 15 ? player : null;
};

/**
 * Handles spot selection logic
 * @param {Object} state - Current game state
 * @param {number} pointId - ID of the selected poin
 * @returns {Object|null} Selection result with type and relevant data, or null if invalid
 */
export const selectSpotLogic = (state, pointId) => {
  if (!state.player || !state.diceValue || state.diceValue.length === 0) return null;

  const selectedIndex = pointId - 1;

  if (state.checkersOnBar[state.player]) {
    const startKeyId = state.player === PLAYERS.LEFT ? BOARD_CONFIG.START_KEY_LEFT : BOARD_CONFIG.START_KEY_RIGHT;
    if (Object.keys(state.potentialMoves).includes(pointId.toString())) {
      const moveDistance = (startKeyId + 1) - pointId;
      return { type: 'move', fromIndex: -1, selectedIndex, moveDistance };
    }
    return null;
  }

  if (selectedIndex === -1 || !state.points[selectedIndex] || state.points[selectedIndex].player !== state.player) {
    return null;
  }

  return {
    type: 'select',
    selectedSpot: pointId,
    potentialSpots: state.potentialMoves[pointId] || []
  };
};
