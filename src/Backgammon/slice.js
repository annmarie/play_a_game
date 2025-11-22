import { createSlice } from '@reduxjs/toolkit';
import {
  initializeBoard, togglePlayer, rollDie, moveCheckers,
  generatePointIndexMap, findPotentialMoves
} from './utils';

import { PLAYER_LEFT, PLAYER_RIGHT, START_KEY_LEFT, START_KEY_RIGHT, INVALID_INDEX } from './globals';

const MAX_HISTORY = 10;

export const initialState = {
  points: initializeBoard(),
  checkersOnBar: { [PLAYER_LEFT]: 0, [PLAYER_RIGHT]: 0 },
  diceValue: null,
  player: null,
  selectedSpot: null,
  potentialSpots: [],
  potentialMoves: {},
  history: [],
};

export const slice = createSlice({
  name: 'backgammon',
  initialState,
  reducers: {
    selectSpot: (state, action) => reduceSelectSpot(state, action),
    makeMove: (state, action) => reduceMoveChecker(state, action),
    rollDice: (state) => reduceRollDice(state),
    undoRoll: (state) => reduceUndo(state),
    togglePlayerRoll: (state) => ({ ...state, player: togglePlayer(state.player), diceValue: null }),
    resetGame: () => ({ ...initialState, points: initializeBoard() }),
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
  
  const gameState = {
    points: state.points,
    checkersOnBar: state.checkersOnBar,
    diceValue: state.diceValue,
    player: state.player,
    potentialMoves: state.potentialMoves,
  };
  
  const newHistory = [...state.history, gameState];
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }

  return {
    ...state,
    points: updatedPoints,
    checkersOnBar: updatedCheckersOnBar,
    diceValue: moveInProcess ? updatedDiceValue : null,
    player: moveInProcess ? state.player : togglePlayer(state.player),
    potentialMoves: moveInProcess ? updatedPotentialMoves : {},
    selectedSpot: null,
    potentialSpots: [],
    history: newHistory,
  };
}

function reduceUndo(state) {
  if (state.history.length === 0) return state;
  
  const previousState = state.history[state.history.length - 1];
  const newHistory = state.history.slice(0, -1);

  return {
    ...state,
    ...previousState,
    selectedSpot: null,
    potentialSpots: [],
    history: newHistory,
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
