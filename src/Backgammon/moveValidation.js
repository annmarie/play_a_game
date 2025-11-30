import { PLAYER_LEFT, PLAYER_RIGHT, START_KEY_LEFT, START_KEY_RIGHT } from './globals';
import { getPointIdToIndexMap, getIndexToPointIdMap } from './boardUtils';

/**
 * Validates a bear-off move and returns the dice value to use
 */
export function validateBearOffMove(player, fromPointId, diceValue, points) {
  const moveDistance = player === PLAYER_LEFT ?
    (START_KEY_LEFT + 11) - fromPointId : (START_KEY_RIGHT - 11) - fromPointId;

  if (diceValue.includes(moveDistance)) {
    return { isValid: true, usedDiceValue: moveDistance };
  }

  const higherDice = diceValue.filter(die => die > moveDistance);
  if (higherDice.length === 0) return { isValid: false };

  const homeRange = player === PLAYER_LEFT ?
    [(START_KEY_RIGHT - 5), START_KEY_RIGHT] : [(START_KEY_LEFT - 5), START_KEY_LEFT];
  const occupiedPoints = points
    .filter(p => p.player === player && homeRange[0] <= p.id && p.id <= homeRange[1])
    .map(p => p.id);
  const highestOccupied = Math.min(...occupiedPoints);

  return fromPointId === highestOccupied ?
    { isValid: true, usedDiceValue: higherDice[0] } : { isValid: false };
}

/**
 * Calculates target point ID for a move
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
 * Finds all potential moves for a player
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

  for (const point of points.filter(p => p.player === player)) {
    const uniqueDice = [...new Set(dice)];

    for (const die of uniqueDice) {
      const movePointId = calculatePotentialMove(player, point.id - 1, die);
      const diceCount = dice.filter(d => d === die).length;

      // Handle bearing off
      if (canBearOffNow) {
        const isInHomeBoard = (player === PLAYER_LEFT && point.id >= START_KEY_RIGHT - 5 && point.id <= START_KEY_RIGHT) ||
          (player === PLAYER_RIGHT && point.id >= START_KEY_LEFT - 5 && point.id <= START_KEY_LEFT);

        if (isInHomeBoard) {
          const requiredDie = player === PLAYER_LEFT ? (START_KEY_RIGHT + 1) - point.id : (START_KEY_LEFT + 1) - point.id;

          if (die >= requiredDie) {
            if (die === requiredDie) {
              potentialMoves[point.id] = potentialMoves[point.id] || [];
              for (let i = 0; i < diceCount; i++) {
                potentialMoves[point.id].push(-1);
              }
            } else {
              // Check if this is the furthest occupied point
              const homeRange = player === PLAYER_LEFT ?
                [START_KEY_RIGHT - 5, START_KEY_RIGHT] :
                [START_KEY_LEFT - 5, START_KEY_LEFT];
              const occupiedPoints = points
                .filter(p => p.player === player && p.id >= homeRange[0] && p.id <= homeRange[1])
                .map(p => p.id);
              const furthestOccupied = player === PLAYER_LEFT ? Math.max(...occupiedPoints) : Math.min(...occupiedPoints);

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

      // Handle regular moves
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
 * Moves checkers on the board
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