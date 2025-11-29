import { createSlice } from '@reduxjs/toolkit';
import {
  initializeBoard, togglePlayer, rollDie, moveCheckers,
  generatePointIndexMap, findPotentialMoves, encodeBoardState, decodeBoardState
} from './utils';

import { PLAYER_LEFT, PLAYER_RIGHT, START_KEY_LEFT, START_KEY_RIGHT, INVALID_INDEX, MAX_HISTORY } from './globals';

export const backgammonInitialState = {
  points: initializeBoard(),
  checkersOnBar: { [PLAYER_LEFT]: 0, [PLAYER_RIGHT]: 0 },
  checkersBorneOff: { [PLAYER_LEFT]: 0, [PLAYER_RIGHT]: 0 },
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
  checkersBorneOffHistory: [],
  potentialMovesHistory: [],
};

export const backgammonSlice = createSlice({
  name: 'backgammon',
  initialState: backgammonInitialState,
  reducers: {
    selectSpot: (state, action) => reduceSelectSpot(state, action),
    makeMove: (state, action) => reduceMoveChecker(state, action),
    rollDice: (state) => reduceRollDice(state),
    undoRoll: (state) => reduceUndo(state),
    togglePlayerRoll: (state) => ({ ...state, player: togglePlayer(state.player), diceValue: null }),
    resetGame: () => ({ ...backgammonInitialState, points: initializeBoard() }),
    loadTestBoard: (state, action) => ({
      ...state,
      ...action.payload,
      potentialMoves: action.payload.diceValue ?
        findPotentialMoves(action.payload.points, action.payload.player, action.payload.diceValue, action.payload.checkersOnBar) : {},
      selectedSpot: null,
      potentialSpots: []
    }),
    setCustomDice: (state, action) => ({
      ...state,
      diceValue: action.payload,
      potentialMoves: state.player ?
        findPotentialMoves(state.points, state.player, action.payload, state.checkersOnBar) : {}
    }),
    loadFromURL: (state) => {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get('board');
      if (encoded) {
        const boardState = decodeBoardState(encoded);
        if (boardState) {
          return {
            ...state,
            ...boardState,
            potentialMoves: boardState.diceValue ?
              findPotentialMoves(boardState.points, boardState.player, boardState.diceValue, boardState.checkersOnBar) : {},
            selectedSpot: null,
            potentialSpots: []
          };
        }
      }
      return state;
    },
    saveToURL: (state) => {
      const dataToSave = {
        ...state,
        pointsHistory: state.pointsHistory.length > 0 ? [state.pointsHistory[state.pointsHistory.length - 1]] : [],
        diceHistory: state.diceHistory.length > 0 ? [state.diceHistory[state.diceHistory.length - 1]] : [],
        playerHistory: state.playerHistory.length > 0 ? [state.playerHistory[state.playerHistory.length - 1]] : [],
        checkersOnBarHistory: state.checkersOnBarHistory.length > 0 ? [state.checkersOnBarHistory[state.checkersOnBarHistory.length - 1]] : [],
        checkersBorneOffHistory: state.checkersBorneOffHistory.length > 0 ? [state.checkersBorneOffHistory[state.checkersBorneOffHistory.length - 1]] : [],
        potentialMovesHistory: state.potentialMovesHistory.length > 0 ? [state.potentialMovesHistory[state.potentialMovesHistory.length - 1]] : []
      };
      const encoded = encodeBoardState(dataToSave);
      const url = `${window.location.origin}${window.location.pathname}?board=${encoded}`;
      navigator.clipboard.writeText(url);
      return state;
    },
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

    // Check if the clicked point is a valid entry point
    if (Object.keys(state.potentialMoves).includes(pointId.toString())) {
      const moveDistance = (startKeyId + 1) - pointId
      return updateMoveCheckerState(state, INVALID_INDEX, selectedIndex, moveDistance);
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

  if (!player || !diceValue || diceValue.length === 0) return state;

  // Bearing off move
  if (toPointId === -1) {
    const fromIndex = points.findIndex((point) => point.id === fromPointId);
    if (fromIndex === -1 || points[fromIndex].checkers < 1) return state;

    const moveDistance = player === PLAYER_LEFT ?
      (START_KEY_LEFT + 12) + 1 - fromPointId :
      (START_KEY_RIGHT - 12) + 1 - fromPointId;

    // Check if exact dice value matches
    let isValidDiceValue = diceValue.includes(moveDistance);
    let usedDiceValue = moveDistance;

    // If no exact match, check if we can use a higher dice value (backgammon rule)
    if (!isValidDiceValue) {
      const higherDice = diceValue.filter(die => die > moveDistance);
      if (higherDice.length > 0) {
        const homeRange = player === PLAYER_LEFT ?
          [(START_KEY_RIGHT - 5), START_KEY_RIGHT] :
          [(START_KEY_LEFT - 5), START_KEY_LEFT];

        // Check if this is the highest occupied point for this player
        const occupiedPoints = points
          .filter(p => p.player === player && homeRange[0] <= p.id && p.id <= homeRange[1])
          .map(p => p.id);
        const highestOccupied = Math.min(...occupiedPoints);

        if (fromPointId === highestOccupied) {
          isValidDiceValue = true;
          usedDiceValue = higherDice[0]; // Use the first available higher dice
        }
      }
    }

    if (!isValidDiceValue) return state;

    return updateMoveCheckerState(state, fromIndex, -1, usedDiceValue);
  }

  const fromIndex = points.findIndex((point) => point.id === fromPointId);
  const toIndex = points.findIndex((point) => point.id === toPointId);
  if (fromIndex === -1 || toIndex === -1 || points[fromIndex].checkers < 1) return state;

  const pointKey = generatePointIndexMap(player, 'point');
  const moveDistance = Math.abs(pointKey[toIndex] - pointKey[fromIndex]);
  const isValidDiceValue = diceValue.includes(moveDistance);

  if (!isValidDiceValue || !(pointKey[toIndex] > pointKey[fromIndex])) return state;

  return updateMoveCheckerState(state, fromIndex, toIndex, moveDistance);
}

function updateMoveCheckerState(state, fromIndex, toIndex, moveDistance) {
  const { updatedPoints, hasBarPlayer } = moveCheckers(
    state.points,
    toIndex, fromIndex,
    state.player
  );

  const updatedCheckersOnBar = { ...state.checkersOnBar }
  const updatedCheckersBorneOff = { ...state.checkersBorneOff }

  if (hasBarPlayer) {
    updatedCheckersOnBar[hasBarPlayer] = state.checkersOnBar[hasBarPlayer] || 0;
    updatedCheckersOnBar[hasBarPlayer] += 1;
  }
  if (fromIndex === INVALID_INDEX) {
    updatedCheckersOnBar[state.player] = state.checkersOnBar[state.player] || 1;
    updatedCheckersOnBar[state.player] -= 1;
  }

  if (toIndex === -1) {
    updatedCheckersBorneOff[state.player] = (state.checkersBorneOff[state.player] || 0) + 1;
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
  const winner = updatedCheckersBorneOff[state.player] === 15 ? state.player : null;

  return {
    ...state,
    points: updatedPoints,
    checkersOnBar: updatedCheckersOnBar,
    checkersBorneOff: updatedCheckersBorneOff,
    winner,
    diceValue: moveInProcess && !winner
      ? updatedDiceValue
      : backgammonInitialState.diceValue,
    player: moveInProcess && !winner
      ? state.player
      : winner ? null : togglePlayer(state.player),
    potentialMoves: moveInProcess && !winner
      ? updatedPotentialMoves
      : backgammonInitialState.potentialMoves,
    selectedSpot: null,
    potentialSpots: [],

    pointsHistory: [...state.pointsHistory, state.points].slice(-MAX_HISTORY),
    checkersOnBarHistory: [...state.checkersOnBarHistory, state.checkersOnBar].slice(-MAX_HISTORY),
    checkersBorneOffHistory: [...state.checkersBorneOffHistory, state.checkersBorneOff].slice(-MAX_HISTORY),
    diceHistory: [...state.diceHistory, state.diceValue].slice(-MAX_HISTORY),
    playerHistory: [...state.playerHistory, state.player].slice(-MAX_HISTORY),
    potentialMovesHistory: [...state.potentialMovesHistory, state.potentialMoves].slice(-MAX_HISTORY),
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
    points: state.pointsHistory[state.pointsHistory.length - 1] || backgammonInitialState.points,
    diceValue: state.diceHistory[state.diceHistory.length - 1] || backgammonInitialState.diceValue,
    player: state.playerHistory[state.playerHistory.length - 1] || backgammonInitialState.player,
    potentialMoves: state.potentialMovesHistory[state.potentialMovesHistory.length - 1] || backgammonInitialState.potentialMoves,
    checkersOnBar: state.checkersOnBarHistory[state.checkersOnBarHistory.length - 1] || backgammonInitialState.checkersOnBar,
    checkersBorneOff: state.checkersBorneOffHistory[state.checkersBorneOffHistory.length - 1] || backgammonInitialState.checkersBorneOff,
  };
}

function updateHistoryState(state) {
  return {
    pointsHistory: state.pointsHistory.slice(0, -1),
    diceHistory: state.diceHistory.slice(0, -1),
    playerHistory: state.playerHistory.slice(0, -1),
    potentialMovesHistory: state.potentialMovesHistory.slice(0, -1),
    checkersOnBarHistory: state.checkersOnBarHistory.slice(0, -1),
    checkersBorneOffHistory: state.checkersBorneOffHistory.slice(0, -1),
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

export const { makeMove, rollDice, undoRoll, togglePlayerRoll, resetGame, selectSpot, loadTestBoard, setCustomDice, loadFromURL, saveToURL } = backgammonSlice.actions;

export default backgammonSlice.reducer;
