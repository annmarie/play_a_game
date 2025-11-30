import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';

/**
 * Toggles the current player
 */
export const togglePlayer = (player) => {
  return player === PLAYER_RIGHT ? PLAYER_LEFT : PLAYER_RIGHT;
};

/**
 * Simulates rolling a six-sided die
 */
export const rollDie = () => {
  return Math.floor(Math.random() * 6) + 1;
};

/**
 * Handles dice rolling logic for backgammon game
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
  const player = currentPlayer === null ? (die2 > die1 ? PLAYER_RIGHT : PLAYER_LEFT) : currentPlayer;

  return { diceValue, player };
}

/**
 * Checks if a player has won
 */
export const checkWinner = (checkersBorneOff, player) => {
  return checkersBorneOff[player] === 15 ? player : null;
};

/**
 * Handles spot selection logic
 */
export const selectSpotLogic = (state, pointId) => {
  if (!state.player || !state.diceValue || state.diceValue.length === 0) return null;

  const selectedIndex = pointId - 1;

  if (state.checkersOnBar[state.player]) {
    const startKeyId = state.player === 'left' ? 12 : 24;
    if (Object.keys(state.potentialMoves).includes(pointId.toString())) {
      const moveDistance = (startKeyId + 1) - pointId;
      return { type: 'move', fromIndex: -1, selectedIndex, moveDistance };
    }
    return null;
  }

  if (selectedIndex === -1 || state.points[selectedIndex].player !== state.player) {
    return null;
  }

  return {
    type: 'select',
    selectedSpot: pointId,
    potentialSpots: state.potentialMoves[pointId] || []
  };
};
