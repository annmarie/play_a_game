import { PLAYER_LEFT, PLAYER_RIGHT, START_KEY_LEFT, START_KEY_RIGHT } from './globals';
import { RIGHT_PLAYER_POINT_ORDER, LEFT_PLAYER_POINT_ORDER } from './globals';

/**
 * Initializes the game board.
 * Right starts at point 12 and Left starts at point 24
 * @returns {Array} Array of points with their initial state.
 */
export const initializeBoard = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const id = i + 1;
    let checkers = 0;
    let player = null;
    if (id === 1) { checkers = 5; player = PLAYER_LEFT; }
    if (id === 5) { checkers = 3; player = PLAYER_RIGHT; }
    if (id === 7) { checkers = 5; player = PLAYER_RIGHT; }
    if (id === 12) { checkers = 2; player = PLAYER_LEFT; }
    if (id === 13) { checkers = 5; player = PLAYER_RIGHT; }
    if (id === 17) { checkers = 3; player = PLAYER_LEFT; }
    if (id === 19) { checkers = 5; player = PLAYER_LEFT; }
    if (id === 24) { checkers = 2; player = PLAYER_RIGHT; }
    return { id, checkers, player };
  });
};

/**
 * Simulates rolling a six-sided die.
 * @returns {number} A random number between 1 and 6.
 */
export const rollDie = () => {
  return Math.floor(Math.random() * 6) + 1;
};

/**
 * Toggles the current player
 * @param {string} player - The current player.
 * @returns {string} The next player.
 */
export const togglePlayer = (player) => {
  return player === PLAYER_RIGHT ? PLAYER_LEFT : PLAYER_RIGHT;
};

/**
 * the point order array for the given player.
 * @param {string} player
 * @returns {Array<number>}
 */
export const getPointOrder = (player) => (
  player === PLAYER_RIGHT ? RIGHT_PLAYER_POINT_ORDER : LEFT_PLAYER_POINT_ORDER
);

/**
 * map from pointId to index in the player's travel order.
 * @param {string} player
 * @returns {Object<number, number>} mapping pointId -> index
 */
export const getPointIdToIndexMap = (player) => (
  getPointOrder(player).reduce((map, pointId, index) => { map[pointId - 1] = index; return map; }, {})
);

/**
 * map from index in the player's travel order to pointId
 * @param {string} player
 * @returns {Object<number, number>}
 */
export const getIndexToPointIdMap = (player) => (
  getPointOrder(player).reduce((map, pointId, index) => { map[index] = pointId - 1; return map; }, {}));

/**
 * Generates a mapping of point IDs to their indices for a given player.
 * or a mapping of indices to point IDs for a given player.
 * @param {string} player - The current player
 * @param {string} indexBy - The index to set for the mapping
 * @returns {Object} A mapping of point IDs to indices.
 */
export const generatePointIndexMap = (player, indexBy = 'point') => {
  if (indexBy === 'point') return getPointIdToIndexMap(player);
  return getIndexToPointIdMap(player);
};

/**
 * Calculates the target point ID based on the current player, selected index, and die roll.
 * @param {string} player - The current player ("PLAYER_RIGHT" or "PLAYER_LEFT").
 * @param {number} selectedIndex - The index of the selected point.
 * @param {number} die - The die roll.
 * @returns {number} The target point ID, or -2 for bearing off, or -1 if invalid.
 */
export const calculatePotentialMove = (player, selectedIndex, die) => {
  const pointIdToIndexMap = getPointIdToIndexMap(player);
  const indexToPointIdMap = getIndexToPointIdMap(player);

  const currentPosition = pointIdToIndexMap[selectedIndex];
  const targetIndex = currentPosition + die;

  // Check for bearing off (moving beyond the board)
  if (targetIndex >= 24) {
    return -2; // Special value for bearing off
  }

  return typeof indexToPointIdMap[targetIndex] === 'number'
    ? indexToPointIdMap[targetIndex]
    : -1;
};

/**
 * Checks if all player's checkers are in home board
 * @param {Array} points - The board points
 * @param {string} player - The player to check
 * @param {Object} checkersOnBar - Checkers on bar
 * @returns {boolean} True if all checkers are in home board
 */
export const canBearOff = (points, player, checkersOnBar) => {
  if (checkersOnBar[player] > 0) return false;

  const homeRange = player === PLAYER_LEFT ?
    [START_KEY_RIGHT - 5, START_KEY_RIGHT] :
    [START_KEY_LEFT - 5, START_KEY_LEFT];

  return points.every((point) => {
    if (point.player !== player) return true;
    return point.id >= homeRange[0] && point.id <= homeRange[1];
  });
};

/**
 * Finds all potential moves for a player based on the current game state.
 *
 * @param {Array} points - The array of points on the board. Each point should have the following structure:
 * @param {string} player - The current player for whom potential moves are being calculated.
 * @param {Array} diceValue - An array of dice values rolled by the player.
 * @returns {Object} An object mapping point IDs to arrays of target point IDs where moves are possible.
 *   - Key: The `id` of the starting point.
 *   - Value: An array of `id`s of target points where the player can move.
 */
export function findPotentialMoves(points, player, diceValue, checkersOnBar) {
  const dice = new Set(diceValue);
  const potentialMoves = {};
  const hasCheckerOnBar = (checkersOnBar[player] || 0) > 0;

  if (hasCheckerOnBar) {
    const startPointId = player === PLAYER_LEFT ? START_KEY_LEFT : START_KEY_RIGHT;
    for (const die of dice) {
      const dieValue = Number(die);
      if (!Number.isFinite(dieValue) || dieValue < 1 || dieValue > 6) continue;
      const targetPointId = (startPointId + 1) - dieValue;
      if (targetPointId < 1 || targetPointId > 24) continue;
      const targetPoint = points[targetPointId - 1];
      if (!targetPoint) continue;

      // valid if empty, owned by player, or single opponent checker
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

  for (const point of points.filter(p => p.player === player)) {
    for (const die of dice) {
      const movePointId = calculatePotentialMove(player, point.id - 1, die);

      if (canBearOffNow) {
        const pointId = point.id;

        // Only points in the player's home board can bear off
        const isInHomeBoard = (player === PLAYER_LEFT && pointId >= START_KEY_RIGHT - 5 && pointId <= START_KEY_RIGHT) ||
          (player === PLAYER_RIGHT && pointId >= START_KEY_LEFT - 5 && pointId <= START_KEY_LEFT);
        if (!isInHomeBoard) {
          // Not in home board, cannot bear off from this point
        } else {
          const requiredDie = player === PLAYER_LEFT ? (START_KEY_RIGHT + 1) - pointId : (START_KEY_LEFT + 1) - pointId;
          const exactMatch = die === requiredDie;
          const canBearOffFromThisPoint = die >= requiredDie;

          if (canBearOffFromThisPoint) {
            // Exact die always allows bearing off
            if (exactMatch) {
              potentialMoves[point.id] = potentialMoves[point.id] || [];
              potentialMoves[point.id].push(-1);
            } else {

              // For larger dice, only allow if this is the furthest occupied point in home section
              const homeRange = player === PLAYER_LEFT ?
                [START_KEY_RIGHT - 5, START_KEY_RIGHT] :
                [START_KEY_LEFT - 5, START_KEY_LEFT];
              const occupiedPoints = points
                .filter(p => p.player === player && p.id >= homeRange[0] && p.id <= homeRange[1])
                .map(p => p.id);

              if (occupiedPoints.length > 0) {
                const furthestOccupied = player === PLAYER_LEFT ? Math.max(...occupiedPoints) : Math.min(...occupiedPoints);
                if (pointId === furthestOccupied) {
                  potentialMoves[point.id] = potentialMoves[point.id] || [];
                  potentialMoves[point.id].push(-1);
                }
              }
            }
          }
        }
      }

      if (movePointId === -2 && canBearOffNow) {
        // Check if this is an exact move or if it's the highest occupied point
        const pointId = point.id;
        const requiredDie = player === PLAYER_LEFT ? 25 - pointId : 13 - pointId;
        const exactMatch = die === requiredDie;

        if (exactMatch) {
          potentialMoves[point.id] = potentialMoves[point.id] || [];
          potentialMoves[point.id].push(-1);
        } else {
          // Only allow bearing off with higher dice if this is the highest occupied point
          const homeRange = player === PLAYER_LEFT ?
                [START_KEY_RIGHT - 5, START_KEY_RIGHT] :
                [START_KEY_LEFT - 5, START_KEY_LEFT];
          const occupiedPoints = points
            .filter(p => p.player === player && p.id >= homeRange[0] && p.id <= homeRange[1])
            .map(p => p.id);
          const highestOccupied = player === PLAYER_LEFT ?
            Math.max(...occupiedPoints) : Math.min(...occupiedPoints);

          if (pointId === highestOccupied) {
            potentialMoves[point.id] = potentialMoves[point.id] || [];
            potentialMoves[point.id].push(-1);
          }
        }
      } else if (movePointId >= 0) {
        const targetPoint = points[movePointId];
        if (
          targetPoint.checkers === 0 ||
          targetPoint.player === player ||
          (targetPoint.checkers === 1 && targetPoint.player !== player)
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
 * Moves checkers on the board.
 *
 * @param {Array} points - The current state of the board.
 * @param {number} toIndex - The index of the destination point (0-based) or -1 for bearing off.
 * @param {number} fromIndex - The index of the source point (0-based).
 * @param {string} player - The player making the move.
 * @returns {Object} An object containing updated points and checkers on the bar.
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
  } else {
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


