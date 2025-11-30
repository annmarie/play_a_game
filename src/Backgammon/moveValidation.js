import { PLAYER_LEFT, START_KEY_LEFT, START_KEY_RIGHT } from './globals';
import { getPointIdToIndexMap, getIndexToPointIdMap } from './boardUtils';

/**
 * Gets the furthest occupied point in home board for bear-off validation
 * @param {Object[]} points - Array of point objects representing the board state
 * @param {string} player - The player to check
 * @returns {number} The furthest occupied point ID
 */
function getFurthestOccupiedPoint(points, player) {
  const homeRange = player === PLAYER_LEFT ? [19, 24] : [7, 12];
  const occupiedPoints = points
    .filter(p => p.player === player && p.id >= homeRange[0] && p.id <= homeRange[1])
    .map(p => p.id);
  return player === PLAYER_LEFT ? Math.min(...occupiedPoints) : Math.min(...occupiedPoints);
}

/**
 * Validates a bear-off move and returns the dice value to use
 * @param {string} player - The player making the move (PLAYER_LEFT or PLAYER_RIGHT)
 * @param {number} fromPointId - The point ID where the checker is being moved from
 * @param {number[]} diceValue - Array of available dice values
 * @param {Object[]} points - Array of point objects representing the board state
 * @returns {{isValid: boolean, usedDiceValue?: number}} Validation result with dice value used
 */
export function validateBearOffMove(player, fromPointId, diceValue, points) {
  const moveDistance = player === PLAYER_LEFT ? 25 - fromPointId : 13 - fromPointId;

  if (diceValue.includes(moveDistance)) {
    return { isValid: true, usedDiceValue: moveDistance };
  }

  const higherDice = diceValue.filter(die => die > moveDistance);
  if (higherDice.length === 0) return { isValid: false };

  const furthestOccupied = getFurthestOccupiedPoint(points, player);

  return fromPointId === furthestOccupied ?
    { isValid: true, usedDiceValue: higherDice[0] } : { isValid: false };
}

/**
 * Calculates target point ID for a move
 * @param {string} player - The player making the move
 * @param {number} selectedIndex - The index of the selected point
 * @param {number} die - The dice value to use for the move
 * @returns {number} Target point ID (-2 for bearing off, -1 for invalid move)
 */
export const calculatePotentialMove = (player, selectedIndex, die) => {
  const pointIdToIndexMap = getPointIdToIndexMap(player);
  const indexToPointIdMap = getIndexToPointIdMap(player);

  const currentPosition = pointIdToIndexMap[selectedIndex];
  const targetIndex = currentPosition + die;

  if (targetIndex >= 24) return -2; // Bearing off

  return typeof indexToPointIdMap[targetIndex] === 'number' ? indexToPointIdMap[targetIndex] : -1;
};

/**
 * Checks if all player's checkers are in home board
 * @param {Object[]} points - Array of point objects representing the board state
 * @param {string} player - The player to check
 * @param {Object} checkersOnBar - Object tracking checkers on the bar for each player
 * @returns {boolean} True if player can bear off checkers
 */
export const canBearOff = (points, player, checkersOnBar) => {
  if (checkersOnBar[player] > 0) return false;

  const homeRange = player === PLAYER_LEFT ? [19, 24] : [7, 12];

  return points.every((point) => {
    if (point.player !== player) return true;
    return point.id >= homeRange[0] && point.id <= homeRange[1];
  });
};

/**
 * Finds all potential moves for a player
 * @param {Object[]} points - Array of point objects representing the board state
 * @param {string} player - The player to find moves for
 * @param {number[]} diceValue - Array of available dice values
 * @param {Object} checkersOnBar - Object tracking checkers on the bar for each player
 * @returns {Object} Object mapping point IDs to arrays of possible target points
 */
export function findPotentialMoves(points, player, diceValue, checkersOnBar) {
  const dice = diceValue; // Don't use Set to preserve duplicates
  const potentialMoves = {};
  const hasCheckerOnBar = (checkersOnBar[player] || 0) > 0;

  if (hasCheckerOnBar) {
    const startPointId = player === PLAYER_LEFT ? START_KEY_LEFT : START_KEY_RIGHT;
    const uniqueDice = [...new Set(dice)];
    for (const die of uniqueDice) {
      const targetPointId = (startPointId + 1) - die;
      if (targetPointId < 1 || targetPointId > 24) continue;
      const targetPoint = points[targetPointId - 1];
      if (!targetPoint) continue;

      if (
        targetPoint.checkers === 0 ||
        targetPoint.player === player ||
        (targetPoint.checkers === 1 && targetPoint.player !== player)
      ) {
        potentialMoves[targetPointId] = potentialMoves[targetPointId] || [];
      }
    }
    return potentialMoves;
  }

  const canBearOffNow = canBearOff(points, player, checkersOnBar);
  const uniqueDice = [...new Set(dice)];

  for (const point of points.filter(p => p.player === player)) {
    for (const die of uniqueDice) {
      const movePointId = calculatePotentialMove(player, point.id - 1, die);
      const diceCount = dice.filter(d => d === die).length;

      // Handle bearing off
      if (canBearOffNow) {
        const homeRange = player === PLAYER_LEFT ? [19, 24] : [7, 12];
        const isInHomeBoard = point.id >= homeRange[0] && point.id <= homeRange[1];

        if (isInHomeBoard) {
          const requiredDie = player === PLAYER_LEFT ? 25 - point.id : 13 - point.id;

          if (die >= requiredDie) {
            if (die === requiredDie) {
              potentialMoves[point.id] = potentialMoves[point.id] || [];
              for (let i = 0; i < diceCount; i++) {
                potentialMoves[point.id].push(-1);
              }
            } else {
              const furthestOccupied = getFurthestOccupiedPoint(points, player);
              if (point.id === furthestOccupied) {
                potentialMoves[point.id] = potentialMoves[point.id] || [];
                for (let i = 0; i < diceCount; i++) {
                  potentialMoves[point.id].push(-1);
                }
              }
            }
          }
        }
      }

      // Handle point to point moves
      if (movePointId >= 0 && movePointId < points.length) {
        const targetPoint = points[movePointId];
        if (
          targetPoint &&
          (targetPoint.checkers === 0 ||
          targetPoint.player === player ||
          (targetPoint.checkers === 1 && targetPoint.player !== player))
        ) {
          potentialMoves[point.id] = potentialMoves[point.id] || [];
          potentialMoves[point.id].push(targetPoint.id);
        }
      }
    }
  }

  return potentialMoves;
}

/**
 * Moves checkers on the board
 * @param {Object[]} points - Array of point objects representing the board state
 * @param {number} toIndex - Target point index (-1 for bearing off)
 * @param {number} fromIndex - Source point index
 * @param {string} player - The player making the move
 * @returns {{updatedPoints: Object[], hasBarPlayer: string}} Updated board state and any captured player
 */
export function moveCheckers(points, toIndex, fromIndex, player) {
  let hasBarPlayer = '';
  const updatedPoints = [...points];
  const isBearingOff = toIndex === -1;

  if (isBearingOff) {
    if (fromIndex >= 0 && updatedPoints[fromIndex]) {
      const newCheckers = updatedPoints[fromIndex].checkers - 1;
      updatedPoints[fromIndex] = {
        ...updatedPoints[fromIndex],
        checkers: newCheckers,
        player: newCheckers === 0 ? null : player,
      };
    }
    return { updatedPoints, hasBarPlayer };
  }

  if (toIndex < 0 || toIndex >= points.length) {
    return { updatedPoints: points, hasBarPlayer };
  }

  const destinationPoint = points[toIndex];
  if (!destinationPoint) {
    return { updatedPoints: points, hasBarPlayer };
  }

  if (destinationPoint.checkers === 1 && destinationPoint.player !== player) {
    hasBarPlayer = destinationPoint.player;
    updatedPoints[toIndex] = {
      ...updatedPoints[toIndex],
      checkers: 1,
      player: player,
    };
  } else if (updatedPoints[toIndex]) {
    updatedPoints[toIndex] = {
      ...updatedPoints[toIndex],
      checkers: updatedPoints[toIndex].checkers + 1,
      player: updatedPoints[toIndex].checkers + 1 === 1 ? player : updatedPoints[toIndex].player,
    };
  }

  if (fromIndex >= 0 && updatedPoints[fromIndex]) {
    const newCheckers = updatedPoints[fromIndex].checkers - 1;
    updatedPoints[fromIndex] = {
      ...updatedPoints[fromIndex],
      checkers: newCheckers,
      player: newCheckers === 0 ? null : player,
    };
  }

  return { updatedPoints, hasBarPlayer };
}
