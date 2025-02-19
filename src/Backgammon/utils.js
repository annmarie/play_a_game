import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';

export const initializeBoard = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const id = i + 1;
    let checkers = 0;
    let player = null;

    if (id === 1) {
      checkers = 5;
      player = PLAYER_LEFT
    }
    if (id === 12) {
      checkers = 2;
      player = PLAYER_LEFT
    }
    if (id === 17) {
      checkers = 3;
      player = PLAYER_LEFT
    }
    if (id === 19) {
      checkers = 5;
      player = PLAYER_LEFT
    }

    if (id === 24) {
      checkers = 2;
      player = PLAYER_RIGHT
    }
    if (id === 13) {
      checkers = 5;
      player = PLAYER_RIGHT
    }
    if (id === 7) {
      checkers = 5;
      player = PLAYER_RIGHT
    }
    if (id === 5) {
      checkers = 3;
      player = PLAYER_RIGHT
    }

    return { id, checkers, player };
  });
}

export const rollDie = () => {
  return Math.floor(Math.random() * 6) + 1;
}

export const togglePlayer = (player) => {
  return player === PLAYER_RIGHT ? PLAYER_LEFT : PLAYER_RIGHT;
}

export const rightPointOrder = [
  24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
];

export const leftPointOrder = [...rightPointOrder].reverse();

//TODO: rename this point order or something else
export const getPointKey = (player) => {
  const pointOrder = player === PLAYER_RIGHT ? [...rightPointOrder] : [...leftPointOrder];
  return Object.fromEntries([...pointOrder].map((pointId, index) => [pointId - 1, index]));
}

export const getPointIndex = (player) => {
  const pointOrder = player === PLAYER_RIGHT ? [...rightPointOrder] : [...leftPointOrder];
  return Object.fromEntries([...pointOrder].map((pointId, index) => [index, pointId - 1]));
}

export const getTargetPointId = (player, selectedIndex, die) => {
  const pointKey = getPointKey(player);
  const pointIndex = getPointIndex(player);
  return pointIndex[Math.abs(pointKey[selectedIndex] + die)];
}

export const updatePoints = (points, fromIndex, toIndex, player) => {
  const updatedPoints = [...points];

  updatedPoints[fromIndex] = {
    ...updatedPoints[fromIndex],
    checkers: updatedPoints[fromIndex].checkers - 1,
    player: updatedPoints[fromIndex].checkers - 1 === 0 ? null : player,
  };

  updatedPoints[toIndex] = {
    ...updatedPoints[toIndex],
    checkers: updatedPoints[toIndex].checkers + 1,
    player: updatedPoints[toIndex].checkers + 1 === 1 ? player : updatedPoints[toIndex].player,
  };

  return updatedPoints;
}

