import {
  PLAYER, BOARD_CONFIG, POINT_ORDERS
} from '../globals';

/**
 * Initializes the game board with standard backgammon starting positions
 * @returns {Object[]} Array of 24 point objects with id, checkers count, and player
 */
export const initializeBoard = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const id = i + 1;
    let checkers = 0;
    let player = null;
    if (id === 1) { checkers = 5; player = PLAYER.LEFT; }
    if (id === 5) { checkers = 3; player = PLAYER.RIGHT; }
    if (id === 7) { checkers = 5; player = PLAYER.RIGHT; }
    if (id === 12) { checkers = 2; player = PLAYER.LEFT; }
    if (id === 13) { checkers = 5; player = PLAYER.RIGHT; }
    if (id === 17) { checkers = 3; player = PLAYER.LEFT; }
    if (id === 19) { checkers = 5; player = PLAYER.LEFT; }
    if (id === 24) { checkers = 2; player = PLAYER.RIGHT; }
    return { id, checkers, player };
  });
};

/**
 * Gets point order array for the given player
 * @param {string} player - The player (PLAYER_LEFT or PLAYER_RIGHT)
 * @returns {number[]} Array of point IDs in player's travel order
 */
export const getPointOrder = (player) => (
  player === PLAYER.RIGHT ? POINT_ORDERS.RIGHT_PLAYER : POINT_ORDERS.LEFT_PLAYER
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
 * Gets home board range for a player
 * @param {string} player - The player
 * @returns {number[]} [min, max] point IDs for home board
 */
export const getHomeRange = (player) => {
    return player === PLAYER.LEFT ?
    [BOARD_CONFIG.START_KEY_RIGHT - 5, BOARD_CONFIG.START_KEY_RIGHT] :
    [BOARD_CONFIG.START_KEY_LEFT - 5, BOARD_CONFIG.START_KEY_LEFT];
}

