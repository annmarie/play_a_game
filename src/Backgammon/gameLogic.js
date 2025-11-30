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
  let die1 = rollDie();
  let die2 = rollDie();

  if (currentPlayer === null) {
    let rollCnt = 0;
    while (die1 === die2 && rollCnt < 10) {
      die1 = rollDie();
      die2 = rollDie();
      rollCnt++;
    }
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
