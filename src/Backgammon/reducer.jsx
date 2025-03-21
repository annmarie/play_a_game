/**
 * backgammon reducer
 */
import {
  PLAYER_LEFT, PLAYER_RIGHT, INVALID_INDEX,
  START_KEY_LEFT, START_KEY_RIGHT
} from './globals';
import {
  SELECT_SPOT, MOVE_CHECKER, ROLL_DICE,
  UNDO, RESET, TOGGLE_PLAYER
} from './actionTypes';
import {
  initializeBoard, togglePlayer, rollDie, moveCheckers,
  generatePointIndexMap, findPotentialMoves
} from './utils';

/**
 * Initial state of the game.
 * - `points`: Represents the board state with checkers and players.
 * = `checkersOnBar`: Number of checkers on the bar for each player.
 * - `diceValue`: The current dice values rolled.
 * - `player`: The current player (PLAYER_LEFT or PLAYER_RIGHT).
 * - `selectedSpot`: The currently selected spot on the board.
 * - `potentialSpots`: The potential spots a checker can move to.
 * - `potentialMoves`: The potential moves based on player and dice roll.
 * - `pointsHistory`: History of board states for undo functionality.
 * - `diceHistory`: History of dice rolls for undo functionality.
 * - `playerHistory`: History of player turns for undo functionality.
 * - `potentialMovesHistory`: History of potential moves for undo functionality.
 * - `checkersOnBarHistory`: History of checkers on bar for undo functionality.
 */
export const initialState = {
  points: initializeBoard(),
  checkersOnBar: { [PLAYER_LEFT]: 0, [PLAYER_RIGHT]: 0 },
  diceValue: null,
  player: null,
  selectedSpot: null,
  potentialSpots: [],
  potentialMoves: {},
  pointsHistory: [],
  diceHistory: [],
  playerHistory: [],
  checkersOnBarHistory: [],
  potentialMovesHistory: [],
};

/**
 * Reducer function
 * @param {Object} state - The current state of the game.
 * @param {Object} action - The action to be performed.
 * @returns {Object} - The updated state.
 */
export const reducer = (state, action) => {
  switch (action.type) {
    case ROLL_DICE:
      return reduceRollDice(state);

    case SELECT_SPOT:
      return reduceSelectSpot(state, action);

    case MOVE_CHECKER:
      return reduceMoveChecker(state, action);

    case TOGGLE_PLAYER:
      return { ...state, player: togglePlayer(state.player), diceValue: null }

    case UNDO:
      return reduceUndo(state);

    case RESET:
      return { ...initialState, points: initializeBoard() };

    default:
      return state || initialState;
  }
};

/**
 * Determines potential spots a checker can move to based on dice values.
 * @param {Object} state - The current state.
 * @param {Object} action - The action containing the selected spot.
 * @returns {Object} - The updated state with potential spots.
 */
function reduceSelectSpot(state, action) {
  if (
    state.player === null ||
    state.diceValue === null ||
    state.diceValue.length === 0
  ) {
    return state;
  }

  const pointId = action.payload;
  const selectedIndex = pointId - 1;

  if (state.checkersOnBar[state.player]) {
    const startKeyId = state.player === PLAYER_LEFT ? START_KEY_LEFT : START_KEY_RIGHT;

    for (const potentialPointId of Object.keys(state.potentialMoves)) {
      if (pointId == potentialPointId) {
        const moveDistance = startKeyId - potentialPointId;
        return updateMoveCheckerState(state, INVALID_INDEX, selectedIndex, moveDistance)
      }
    }
    return state;
  }

  if (
    selectedIndex === INVALID_INDEX ||
    state.points[selectedIndex].player !== state.player
  ) {
    return state;
  }

  return {
    ...state,
    selectedSpot: pointId,
    potentialSpots: state.potentialMoves[pointId] || []
  };
}

/**
 * Moves a checker from one spot to another and updates the game state.
 * @param {Object} state - The current state.
 * @param {Object} action - The action containing from and to point IDs.
 * @returns {Object} - The updated state after moving the checker.
 */
function reduceMoveChecker(state, { payload: { fromPointId, toPointId } }) {
  const { player, diceValue, points } = state;

  if (
    !player || !diceValue ||
    diceValue.length === 0
  ) return state;

  const fromIndex = points.findIndex((point) => point.id === fromPointId);
  const toIndex = points.findIndex((point) => point.id === toPointId);
  if (
    fromIndex === -1 || toIndex === -1 ||
    points[fromIndex].checkers < 1
  ) return state;

  const pointKey = generatePointIndexMap(player, 'point');
  const moveDistance = Math.abs(pointKey[toIndex] - pointKey[fromIndex]);
  const isValidDiceValue = diceValue.includes(moveDistance);

  if (
    !isValidDiceValue ||
    !(pointKey[toIndex] > pointKey[fromIndex])
  ) return state;

  return updateMoveCheckerState(state, fromIndex, toIndex, moveDistance);
}

/**
 * Update state for a checker move.
 * @param {Object} state - The current state.
 * @returns {Object} - The updated state after moving the checker.
 */
function updateMoveCheckerState(state, fromIndex, toIndex, moveDistance) {
  const { updatedPoints, hasBarPlayer } = moveCheckers(
    state.points,
    toIndex, fromIndex,
    state.player
  );
  const updatedCheckersOnBar = { ...state.checkersOnBar }
  if (hasBarPlayer) {
    updatedCheckersOnBar[hasBarPlayer] = state.checkersOnBar[hasBarPlayer] || 0;
    updatedCheckersOnBar[hasBarPlayer] += 1;
  }
  if (fromIndex === INVALID_INDEX) {
    updatedCheckersOnBar[state.player] = state.checkersOnBar[state.player] || 1;
    updatedCheckersOnBar[state.player] -= 1;
  }

  const updatedDiceValue = state.diceValue.filter((dv, index) =>
    index !== state.diceValue.findIndex((d) => d === moveDistance)
  );

  const updatedPotentialMoves = findPotentialMoves(
    updatedPoints,
    state.player,
    updatedDiceValue,
    updatedCheckersOnBar
  );

  const moveInProcess = updatedDiceValue.length > 0;

  return {
    ...state,
    points: updatedPoints,
    checkersOnBar: updatedCheckersOnBar,
    diceValue: moveInProcess
      ? updatedDiceValue
      : initialState.diceValue,
    player: moveInProcess
      ? state.player
      : togglePlayer(state.player),
    potentialMoves: moveInProcess
      ? updatedPotentialMoves
      : initialState.potentialMoves,
    selectedSpot: null,
    potentialSpots: [],

    pointsHistory: [...state.pointsHistory, state.points],
    checkersOnBarHistory: [...state.checkersOnBarHistory, state.checkersOnBar],
    diceHistory: [...state.diceHistory, state.diceValue],
    playerHistory: [...state.playerHistory, state.player],
    potentialMovesHistory: [...state.potentialMovesHistory, state.potentialMoves],
  };
}

/**
 * Reverts the game state to the previous state.
 * @param {Object} state - The current state.
 * @returns {Object} - The updated state after undoing the last action and histories.
 */
function reduceUndo(state) {
  const previousActionState = getPreviousActionState(state);
  const updatedHistoryState = updateHistoryState(state);

  return {
    ...state,
    ...previousActionState,
    ...updatedHistoryState,
    selectedSpot: null,
    potentialSpots: [],
  };
}

/**
 * Gets the previous state values
 * @param {Object} state - The current state.
 * @returns {Object} - The updated state after undoing the last action.
 */
function getPreviousActionState(state) {
  return {
    points: state.pointsHistory[state.pointsHistory.length - 1] || initialState.points,
    diceValue: state.diceHistory[state.diceHistory.length - 1] || initialState.diceValue,
    player: state.playerHistory[state.playerHistory.length - 1] || initialState.player,
    potentialMoves: state.potentialMovesHistory[state.potentialMovesHistory.length - 1] || initialState.potentialMoves,
    checkersOnBar: state.checkersOnBarHistory[state.checkersOnBarHistory.length - 1] || initialState.checkersOnBar,
  };
}

/**
 * Gets the previous state histories
 * @param {Object} state - The current state.
 * @returns {Object} - The updated state after undoing the last histories.
 */
function updateHistoryState(state) {
  return {
    pointsHistory: state.pointsHistory.slice(0, -1),
    diceHistory: state.diceHistory.slice(0, -1),
    playerHistory: state.playerHistory.slice(0, -1),
    potentialMovesHistory: state.potentialMovesHistory.slice(0, -1),
    checkersOnBarHistory: state.checkersOnBarHistory.slice(0, -1),
  };
}

/**
 * Rolls the dice and determines the starting player if it's the first roll.
 * @param {Object} state - The current state.
 * @returns {Object} - The updated state with new dice values and player.
 */
function reduceRollDice(state) {
  let die1 = null;
  let die2 = null;

  let rollCnt = 0;
  const rollMax = 10;
  if (state.player === null) {
    while (die1 === die2 && rollCnt < rollMax) {
      die1 = rollDie();
      die2 = rollDie();
      rollCnt++;
      if (rollCnt >= rollMax) {
        console.error('Roll Error: manually setting dice');
        die1 = 1;
        die2 = 2;
      }
    }
  } else {
    die1 = rollDie();
    die2 = rollDie();
  }

  const diceValue = (die1 === die2)
    ? [die1, die2, die1, die2]
    : [die1, die2];

  const player = state.player === null
    ? die2 > die1 ? PLAYER_RIGHT : PLAYER_LEFT
    : state.player;

  const potentialMoves = findPotentialMoves(
    state.points,
    player,
    diceValue,
    state.checkersOnBar
  );

  return { ...state, diceValue, potentialMoves, player };
}
