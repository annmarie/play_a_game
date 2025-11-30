import { PLAYER_LEFT, PLAYER_RIGHT, RIGHT_PLAYER_POINT_ORDER, LEFT_PLAYER_POINT_ORDER } from './globals';

/**
 * Initializes the game board
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
 * Gets point order array for the given player
 */
export const getPointOrder = (player) => (
  player === PLAYER_RIGHT ? RIGHT_PLAYER_POINT_ORDER : LEFT_PLAYER_POINT_ORDER
);

/**
 * Creates mapping from pointId to index in player's travel order
 */
export const getPointIdToIndexMap = (player) => (
  getPointOrder(player).reduce((map, pointId, index) => { map[pointId - 1] = index; return map; }, {})
);

/**
 * Creates mapping from index to pointId in player's travel order
 */
export const getIndexToPointIdMap = (player) => (
  getPointOrder(player).reduce((map, pointId, index) => { map[index] = pointId - 1; return map; }, {})
);

/**
 * Generates point index mapping for a player
 */
export const generatePointIndexMap = (player, indexBy = 'point') => {
  if (indexBy === 'point') return getPointIdToIndexMap(player);
  return getIndexToPointIdMap(player);
};
