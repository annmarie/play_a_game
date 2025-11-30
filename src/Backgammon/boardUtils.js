import {
  PLAYER_LEFT, PLAYER_RIGHT, START_KEY_LEFT, START_KEY_RIGHT,
  RIGHT_PLAYER_POINT_ORDER, LEFT_PLAYER_POINT_ORDER,
} from './globals';

/**
 * Initializes the game board with standard backgammon starting positions
 * @returns {Object[]} Array of 24 point objects with id, checkers count, and player
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
 * @param {string} player - The player (PLAYER_LEFT or PLAYER_RIGHT)
 * @returns {number[]} Array of point IDs in player's travel order
 */
export const getPointOrder = (player) => (
  player === PLAYER_RIGHT ? RIGHT_PLAYER_POINT_ORDER : LEFT_PLAYER_POINT_ORDER
);

/**
 * Creates mapping from pointId to index in player's travel order
 * @param {string} player - The player (PLAYER_LEFT or PLAYER_RIGHT)
 * @returns {Object} Map where keys are pointId-1 and values are travel order indices
 */
export const getPointIdToIndexMap = (player) => (
  getPointOrder(player).reduce((map, pointId, index) => { map[pointId - 1] = index; return map; }, {})
);

/**
 * Creates mapping from index to pointId in player's travel order
 * @param {string} player - The player (PLAYER_LEFT or PLAYER_RIGHT)
 * @returns {Object} Map where keys are travel order indices and values are pointId-1
 */
export const getIndexToPointIdMap = (player) => (
  getPointOrder(player).reduce((map, pointId, index) => { map[index] = pointId - 1; return map; }, {})
);

/**
 * Generates point index mapping for a player
 * @param {string} player - The player (PLAYER_LEFT or PLAYER_RIGHT)
 * @param {string} [indexBy='point'] - Mapping direction ('point' or 'index')
 * @returns {Object} Point-to-index or index-to-point mapping based on indexBy parameter
 */
export const generatePointIndexMap = (player, indexBy = 'point') => {
  if (indexBy === 'point') return getPointIdToIndexMap(player);
  return getIndexToPointIdMap(player);
};

/**
 * Gets home board range for a player
 * @param {string} player - The player
 * @returns {number[]} [min, max] point IDs for home board
 */
export const getHomeRange = (player) => {
    return player === PLAYER_LEFT ?
    [START_KEY_RIGHT - 5, START_KEY_RIGHT] :
    [START_KEY_LEFT - 5, START_KEY_LEFT];
}
