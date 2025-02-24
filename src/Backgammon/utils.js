import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';

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
 * Point order for the right player.
 */
export const rightPlayerPointOrder = [
  24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
];

/**
 * Point order for the left player (reverse of the right player's order).
 */
export const leftPlayerPointOrder = [...rightPlayerPointOrder].reverse();

/**
 * Generates a mapping of point IDs to their indices for a given player.
 * or a mapping of indices to point IDs for a given player.
 * @param {string} player - The current player
 * @param {string} indexBy - The index to set for the mapping
 * @returns {Object} A mapping of point IDs to indices.
 */
export const generatePointIndexMap = (player, indexBy = 'point') => {
  const pointOrder = player === PLAYER_RIGHT ? rightPlayerPointOrder : leftPlayerPointOrder;
  return pointOrder.reduce((map, pointId, index) => {
    indexBy === 'point' ? map[pointId - 1] = index : map[index] = pointId - 1;
    return map;
  }, {});
};

/**
 * Calculates the target point ID based on the current player, selected index, and die roll.
 * @param {string} player - The current player ("PLAYER_RIGHT" or "PLAYER_LEFT").
 * @param {number} selectedIndex - The index of the selected point.
 * @param {number} die - The die roll.
 * @returns {number} The target point ID, or 0 if the target index is invalid.
 */
export const calculatePotentialMove = (player, selectedIndex, die) => {
  const pointIdToIndexMap = generatePointIndexMap(player, 'point');
  const indexToPointIdMap = generatePointIndexMap(player, 'index');

  const targetIndex = Math.abs(pointIdToIndexMap[selectedIndex] + die);
  return indexToPointIdMap[targetIndex] >= 0 ? indexToPointIdMap[targetIndex] : -1;
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
  const hasCheckerOnBar = checkersOnBar[player] ? (checkersOnBar[player] || 0) > 0 : 0;

  if (hasCheckerOnBar) {
    const startPointId = generatePointIndexMap(player, 'index')[0] + 1;
    for (const die of dice) {
      const targetPointId = startPointId + 1 - die;
      const targetPoint = points[targetPointId - 1]
      if (
        targetPoint.checkers === 0 ||
        targetPoint.player === player ||
        (targetPoint.checkers === 1 && targetPoint.player !== player)
      ) {
        potentialMoves[targetPointId] = []
      }
    }
    return potentialMoves;
  }

  for (const point of points.filter(p => p.player === player)) {
    for (const die of dice) {
      const movePointId = calculatePotentialMove(player, point.id - 1, die);
      if (movePointId >= 0) {
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
 * @param {Object} checkersOnBar - The number of checkers each player has on the bar.
 * @param {number} toIndex - The index of the destination point.
 * @param {number} fromIndex - The index of the source point.
 * @param {string} player - The player making the move.
 * @returns {Object} An object containing updated points and checkers on the bar.
 */
export function moveCheckers(points, toIndex, fromIndex, player) {
  let hasBarPlayer = '';
  const updatedPoints = [...points];
  const destinationPoint = points[toIndex] || -1;
  if (destinationPoint === -1) return { updatedPoints: points, hasBarPlayer }
  if (destinationPoint.checkers === 1 && destinationPoint.player !== player) {
    hasBarPlayer = destinationPoint.player;
    updatedPoints[toIndex] = {
      ...updatedPoints[toIndex],
      checkers: 0,
      player: null
    }
  }

  if (fromIndex >= 0) {
    updatedPoints[fromIndex] = {
      ...updatedPoints[fromIndex],
      checkers: updatedPoints[fromIndex].checkers - 1,
      player: updatedPoints[fromIndex].checkers - 1 === 0 ? null : player,
    };
  }

  updatedPoints[toIndex] = {
    ...updatedPoints[toIndex],
    checkers: updatedPoints[toIndex].checkers + 1,
    player: updatedPoints[toIndex].checkers + 1 === 1 ? player : updatedPoints[toIndex].player,
  };

  return { updatedPoints, hasBarPlayer };
}
