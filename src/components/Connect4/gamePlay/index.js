import { PLAYERS } from '../globals';
import { isBoardFull, dropChecker, checkWin } from '../boardUtils';
import { isValidMove } from '../moveLogic';

/**
 * Toggles the current player
 * @param {string} player - Current player (PLAYER_ONE or PLAYER_TWO)
 * @returns {string} The opposite player
 */
export const togglePlayer = (player) => {
  return player === PLAYERS.ONE ? PLAYERS.TWO : PLAYERS.ONE;
};

/**
 * Handles move logic for Connect4
 * @param {Object} state - Current game state
 * @param {number} col - Column to drop checker
 * @returns {Object|null} Move result or null if invalid
 */
export const makeMoveLogic = (state, col) => {
  const validation = isValidMove(state, col);
  if (!validation.isValid) {
    return { error: validation.error };
  }

  const { board, player } = state;
  const { currentMove, newBoard } = dropChecker(col, board, player);

  const { haveWinner, desc } = checkWin(newBoard, currentMove);
  const boardFull = isBoardFull(newBoard);
  const nextPlayer = togglePlayer(player);

  return {
    board: newBoard,
    currentMove,
    winner: haveWinner ? player : null,
    winnerDesc: haveWinner ? desc : '',
    boardFull,
    player: nextPlayer,
    haveWinner
  };
};
