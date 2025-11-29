import { PLAYER_LEFT, PLAYER_RIGHT, START_KEY_LEFT, START_KEY_RIGHT } from './globals';
import {
  encodeBoardState as encode,
  decodeBoardState as decode,
  loadBoardFromURL as loadFromURL
} from '../utils/boardEncoder.js';

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
 * Selector: returns the point order array for the given player.
 * @param {string} player
 * @returns {Array<number>}
 */
export const getPointOrder = (player) => (
  player === PLAYER_RIGHT ? rightPlayerPointOrder : leftPlayerPointOrder
);

/**
 * Selector: map from pointId to index in the player's travel order.
 * @param {string} player
 * @returns {Object<number, number>} mapping pointId(0-based) -> index
 */
export const getPointIdToIndexMap = (player) => (
  getPointOrder(player).reduce((map, pointId, index) => {
    map[pointId - 1] = index;
    return map;
  }, {})
);

/**
 * Selector: map from index in the player's travel order to pointId (0-based).
 * @param {string} player
 * @returns {Object<number, number>}
 */
export const getIndexToPointIdMap = (player) => (
  getPointOrder(player).reduce((map, pointId, index) => {
    map[index] = pointId - 1;
    return map;
  }, {})
);

/**
 * Generates a mapping of point IDs to their indices for a given player.
 * or a mapping of indices to point IDs for a given player.
 * @param {string} player - The current player
 * @param {string} indexBy - The index to set for the mapping
 * @returns {Object} A mapping of point IDs to indices.
 */
export const generatePointIndexMap = (player, indexBy = 'point') => {
  // Keep backward-compatible API but implement using selectors.
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
  const hasCheckerOnBar = checkersOnBar[player] ? (checkersOnBar[player] || 0) > 0 : 0;



  if (hasCheckerOnBar) {
    const startPointId = player === PLAYER_LEFT ? START_KEY_LEFT : START_KEY_RIGHT;
    for (const die of dice) {
      const targetPointId = player === PLAYER_LEFT ? (startPointId + 1) - die : (startPointId + 1) - die;
      if (targetPointId >= 1 && targetPointId <= 24) {
        const targetPoint = points[targetPointId - 1];
        if (
          targetPoint.checkers === 0 ||
          targetPoint.player === player ||
          (targetPoint.checkers === 1 && targetPoint.player !== player)
        ) {
          potentialMoves[targetPointId] = [];
        }
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
        let canBearOffFromThisPoint = false;
        let exactMatch = false;

        if (player === PLAYER_LEFT && pointId >= 19 && pointId <= 24) {
          const requiredDie = 25 - pointId;
          exactMatch = die === requiredDie;
          canBearOffFromThisPoint = die >= requiredDie;
        } else if (player === PLAYER_RIGHT && pointId >= 7 && pointId <= 12) {
          const requiredDie = 13 - pointId;
          exactMatch = die === requiredDie;
          canBearOffFromThisPoint = die >= requiredDie;
        }

        if (canBearOffFromThisPoint) {
          // Only allow bearing off with higher dice if this is the highest occupied point
          if (exactMatch) {
            potentialMoves[point.id] = potentialMoves[point.id] || [];
            potentialMoves[point.id].push(-1);

          } else {
            // Check if this is the highest occupied point for higher dice usage
            const homeRange = player === PLAYER_LEFT ?
              [19, 24] : [7, 12];
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
          const homeRange = player === PLAYER_LEFT ? [19, 24] : [7, 12];
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
    if (fromIndex >= 0) {
      updatedPoints[fromIndex] = {
        ...updatedPoints[fromIndex],
        checkers: updatedPoints[fromIndex].checkers - 1,
        player: updatedPoints[fromIndex].checkers - 1 === 0 ? null : player,
      };
    }
    return { updatedPoints, hasBarPlayer };
  }

  const destinationPoint = points[toIndex] || -1;
  if (destinationPoint === -1) return { updatedPoints: points, hasBarPlayer }
  if (destinationPoint.checkers === 1 && destinationPoint.player !== player) {
    hasBarPlayer = destinationPoint.player;
    updatedPoints[toIndex] = {
      ...updatedPoints[toIndex],
      checkers: 1,
      player: player
    }
  } else {
    updatedPoints[toIndex] = {
      ...updatedPoints[toIndex],
      checkers: updatedPoints[toIndex].checkers + 1,
      player: updatedPoints[toIndex].checkers + 1 === 1 ? player : updatedPoints[toIndex].player,
    };
  }

  if (fromIndex >= 0) {
    updatedPoints[fromIndex] = {
      ...updatedPoints[fromIndex],
      checkers: updatedPoints[fromIndex].checkers - 1,
      player: updatedPoints[fromIndex].checkers - 1 === 0 ? null : player,
    };
  }

  return { updatedPoints, hasBarPlayer };
}

/**
 * encodes the current board state to a compact string.
 *
 * @state {Object} state - The current state of the board.
 * @returns {string} Encoded board state.
 */
export const encodeBoardState = (state) => {
  const data = {
    points: state.points.map(p => ({ id: p.id, checkers: p.checkers, player: p.player })),
    checkersOnBar: state.checkersOnBar,
    checkersBorneOff: state.checkersBorneOff,
    player: state.player,
    diceValue: state.diceValue
  };
  return encode(data);
};

export const decodeBoardState = decode;
export const loadBoardFromURL = loadFromURL;

