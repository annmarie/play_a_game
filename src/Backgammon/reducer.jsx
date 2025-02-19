import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';
import {
  SELECT_SPOT, MOVE_CHECKER,
  ROLL_DICE, UNDO, RESET,
} from './actionTypes';
import {
  togglePlayer, rollDie, updatePoints,
  getPointKey, initializeBoard, getTargetPointId
} from './utils';

export const initialState = {
  points: initializeBoard(),
  diceValue: null,
  player: null,
  pointsHistory: [],
  diceHistory: [],
  playerHistory: [],
  selectedSpot: null,
  potentialSpots: [],
};

export const reducer = (state, action) => {
  switch (action.type) {
    case ROLL_DICE:
      return reduceRollDice(state);

    case SELECT_SPOT:
      return reduceSelectSpot(state, action);

    case MOVE_CHECKER:
      return reduceMoveChecker(state, action);

    case UNDO:
      return reduceUndo(state);

    case RESET:
      return { ...initialState, points: initializeBoard() };

    default:
      return state || initialState;
  }
};

function reduceSelectSpot(state, action) {
  if (state.player === null || state.diceValue.length === 0) return state;

  const pointId = action.payload;
  const selectedIndex = pointId - 1;

  if (selectedIndex === -1 || state.points[selectedIndex].player !== state.player) {
    return state;
  }

  const dice = [...new Set(state.diceValue)]
  const potentialSpots = [];

  // check the dice for potential next moves
  for (const die of dice) {
    const targetPointId = getTargetPointId(state.player, selectedIndex, die);
    const targetPoint = state.points[targetPointId];
    if (
      targetPoint.checkers === 0 ||
      targetPoint.player === state.player ||
      (targetPoint.checkers === 1 && targetPoint.player !== state.player)
    ) {
      potentialSpots.push(targetPoint.id);
    }
  }

  return { ...state, selectedSpot: pointId, potentialSpots };
}

function reduceMoveChecker(state, action) {
  if (!state.player || !state.diceValue || state.diceValue.length === 0) return state;

  const { fromPointId, toPointId } = action.payload;

  // deselect spot when selected spot is the requested selected spot
  if (fromPointId === toPointId) return { ...state, selectedSpot: null, potentialSpots: [] };

  const fromIndex = state.points.findIndex((point) => point.id === fromPointId);
  const toIndex = state.points.findIndex((point) => point.id === toPointId);

  if (fromIndex === -1 || toIndex === -1 || state.points[fromIndex].checkers < 1) {
    return state;
  }

  const pointKey = getPointKey(state.player);
  const moveDistance = Math.abs(pointKey[toIndex] - pointKey[fromIndex]);
  const isValidDiceValue = state.diceValue.includes(moveDistance);

  if (!isValidDiceValue || !(pointKey[toIndex] > pointKey[fromIndex])) {
    return state;
  }

  const destinationPoint = state.points[toIndex];
  if (destinationPoint.checkers > 0 && destinationPoint.player !== state.player) {
    return state;
  }

  const updatedPoints = updatePoints(state.points, fromIndex, toIndex, state.player);
  const updatedDiceValue = state.diceValue.filter(
    (die, index) => index !== state.diceValue.findIndex((d) => d === moveDistance)
  );

  const moveInProcess = updatedDiceValue.length > 0;

  return {
    ...state,
    points: updatedPoints,
    diceValue: moveInProcess ? updatedDiceValue : initialState.diceValue,
    player: moveInProcess ? state.player : togglePlayer(state.player),
    pointsHistory: [...state.pointsHistory, state.points],
    diceHistory: [...state.diceHistory, state.diceValue],
    playerHistory: [...state.playerHistory, state.player],
    selectedSpot: null,
    potentialSpots: [],
  };
}

function reduceUndo(state) {
  const previousPoints = state.pointsHistory.pop() || initialState.points;
  const previousDice = state.diceHistory.pop() || initialState.diceValue;
  const previousPlayer = state.playerHistory.pop() || initialState.player;

  return {
    ...state,
    points: previousPoints,
    diceValue: previousDice,
    player: previousPlayer,
    pointsHistory: [...state.pointsHistory],
    diceHistory: [...state.diceHistory],
    playerHistory: [...state.playerHistory],
    selectedSpot: null,
    potentialSpots: [],
  };
}

function reduceRollDice(state) {
  let die1, die2;

  // Ensure the first roll is not doubles
  // and that we don't loop forever
  let rollCnt = 0;
  const rollMax = 10;
  if (state.player === null) {
    while (
      die1 === die2 &&
      rollCnt < rollMax
    ) {
      die1 = rollDie();
      die2 = rollDie();
      rollCnt++;
      if (rollCnt >= rollMax) {
        console.error('Roll Error: manually setting dice')
        die1 = 1
        die2 = 2
      }
    }
  } else {
    die1 = rollDie();
    die2 = rollDie();
  }

  const newDiceValue = (die1 === die2)
    ? [die1, die2, die1, die2]
    : [die1, die2];

  return {
    ...state,
    diceValue: newDiceValue,
    player: state.player === null
      ? die2 > die1 ? PLAYER_RIGHT : PLAYER_LEFT
      : state.player,
  };
}
