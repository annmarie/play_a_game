import { createSlice } from '@reduxjs/toolkit';
import {
  initializeBoard, togglePlayer, rollDie, moveCheckers,
  generatePointIndexMap, findPotentialMoves
} from './utils';

import { PLAYER_LEFT, PLAYER_RIGHT, START_KEY_LEFT, START_KEY_RIGHT, INVALID_INDEX } from './globals';

export const initialState = {
  points: initializeBoard(),
  checkersOnBar: { [PLAYER_LEFT]: 0, [PLAYER_RIGHT]: 0 },
  checkersBornOff: { [PLAYER_LEFT]: 0, [PLAYER_RIGHT]: 0 },
  diceValue: null,
  player: null,
  winner: null,
  selectedSpot: null,
  potentialSpots: [],
  potentialMoves: {},
  pointsHistory: [],
  diceHistory: [],
  playerHistory: [],
  checkersOnBarHistory: [],
  potentialMovesHistory: [],
};

export const slice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    selectSpot: (state, action) => reduceSelectSpot(state, action),
    makeMove: (state, action) => reduceMoveChecker(state, action),
    rollDice: (state) => reduceRollDice(state),
    undoRoll: (state) => reduceUndo(state),
    togglePlayerRoll: (state) => ({ ...state, player: togglePlayer(state.player), diceValue: null }),
    resetGame: () => ({ ...initialState, board: initializeBoard() }),
  },
});

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

function reduceMoveChecker(state, { payload: { fromPointId, toPointId } }) {
  const { player, diceValue, points } = state;

  if (
    !player || !diceValue ||
    diceValue.length === 0
  ) return state;

  // Handle bearing off
  if (toPointId === -1) {
    const fromIndex = points.findIndex((point) => point.id === fromPointId);
    if (fromIndex === -1 || points[fromIndex].checkers < 1) return state;

    const pointKey = generatePointIndexMap(player, 'point');
    const moveDistance = 24 - pointKey[fromIndex];
    const isValidDiceValue = diceValue.includes(moveDistance);

    if (!isValidDiceValue) return state;

    return updateMoveCheckerState(state, fromIndex, -1, moveDistance);
  }

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

function updateMoveCheckerState(state, fromIndex, toIndex, moveDistance) {
  const { updatedPoints, hasBarPlayer } = moveCheckers(
    state.points,
    toIndex, fromIndex,
    state.player
  );

  const updatedCheckersOnBar = { ...state.checkersOnBar }
  const updatedCheckersBornOff = { ...state.checkersBornOff }

  if (hasBarPlayer) {
    updatedCheckersOnBar[hasBarPlayer] = state.checkersOnBar[hasBarPlayer] || 0;
    updatedCheckersOnBar[hasBarPlayer] += 1;
  }
  if (fromIndex === INVALID_INDEX) {
    updatedCheckersOnBar[state.player] = state.checkersOnBar[state.player] || 1;
    updatedCheckersOnBar[state.player] -= 1;
  }

  // Handle bearing off
  if (toIndex === -1) {
    updatedCheckersBornOff[state.player] = (state.checkersBornOff[state.player] || 0) + 1;
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
  const winner = updatedCheckersBornOff[state.player] === 15 ? state.player : null;

  return {
    ...state,
    points: updatedPoints,
    checkersOnBar: updatedCheckersOnBar,
    checkersBornOff: updatedCheckersBornOff,
    winner,
    diceValue: moveInProcess && !winner
      ? updatedDiceValue
      : initialState.diceValue,
    player: moveInProcess && !winner
      ? state.player
      : winner ? null : togglePlayer(state.player),
    potentialMoves: moveInProcess && !winner
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

function getPreviousActionState(state) {
  return {
    points: state.pointsHistory[state.pointsHistory.length - 1] || initialState.points,
    diceValue: state.diceHistory[state.diceHistory.length - 1] || initialState.diceValue,
    player: state.playerHistory[state.playerHistory.length - 1] || initialState.player,
    potentialMoves: state.potentialMovesHistory[state.potentialMovesHistory.length - 1] || initialState.potentialMoves,
    checkersOnBar: state.checkersOnBarHistory[state.checkersOnBarHistory.length - 1] || initialState.checkersOnBar,
  };
}

function updateHistoryState(state) {
  return {
    pointsHistory: state.pointsHistory.slice(0, -1),
    diceHistory: state.diceHistory.slice(0, -1),
    playerHistory: state.playerHistory.slice(0, -1),
    potentialMovesHistory: state.potentialMovesHistory.slice(0, -1),
    checkersOnBarHistory: state.checkersOnBarHistory.slice(0, -1),
  };
}

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

export const { makeMove, rollDice, undoRoll, togglePlayerRoll, resetGame, selectSpot } = slice.actions;

export default slice.reducer;
