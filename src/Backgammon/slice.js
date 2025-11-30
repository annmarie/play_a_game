import { createSlice } from '@reduxjs/toolkit';
import { initializeBoard } from './boardUtils';
import { togglePlayer, checkWinner, rollDiceLogic, selectSpotLogic } from './gameLogic';
import { findPotentialMoves, moveCheckers, generatePointIndexMap, validateBearOffMove } from './moveValidation';
import { createSaveToURL, createLoadFromURL } from '../utils/urlGameState';
import { PLAYER_LEFT, PLAYER_RIGHT, INVALID_INDEX, MAX_HISTORY } from './globals';

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
    selectSpot: (state, action) => {
      const result = selectSpotLogic(state, action.payload);

      if (!result) return state;

      if (result.type === 'move') {
        return updateMoveCheckerState(state, result.fromIndex, result.selectedIndex, result.moveDistance);
      }

      return {
        ...state,
        selectedSpot: result.selectedSpot,
        potentialSpots: result.potentialSpots
      };
    },

    makeMove: (state, { payload: { fromPointId, toPointId } }) => {
      const { player, diceValue, points } = state;
      if (!player || !diceValue || diceValue.length === 0) return state;

      if (toPointId === -1) {
        const fromIndex = points.findIndex((point) => point.id === fromPointId);
        if (fromIndex === -1 || points[fromIndex].checkers < 1) return state;

        const { isValid, usedDiceValue } = validateBearOffMove(player, fromPointId, diceValue, points);
        if (!isValid) return state;
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
    },

    rollDice: (state) => {
      const { diceValue, player } = rollDiceLogic(state.player);
      const potentialMoves = findPotentialMoves(state.points, player, diceValue, state.checkersOnBar);

      return {
        ...state,
        diceValue,
        player,
        potentialMoves,
        selectedSpot: null,
        potentialSpots: []
      };
    },

    undoRoll: (state) => {
      const previousActionState = {
        points: state.pointsHistory[state.pointsHistory.length - 1] || backgammonInitialState.points,
        diceValue: state.diceHistory[state.diceHistory.length - 1] || backgammonInitialState.diceValue,
        player: state.playerHistory[state.playerHistory.length - 1] || backgammonInitialState.player,
        potentialMoves: state.potentialMovesHistory[state.potentialMovesHistory.length - 1] || backgammonInitialState.potentialMoves,
        checkersOnBar: state.checkersOnBarHistory[state.checkersOnBarHistory.length - 1] || backgammonInitialState.checkersOnBar,
        checkersBorneOff: state.checkersBorneOffHistory[state.checkersBorneOffHistory.length - 1] || backgammonInitialState.checkersBorneOff,
      };

      return {
        ...state,
        ...previousActionState,
        pointsHistory: state.pointsHistory.slice(0, -1),
        diceHistory: state.diceHistory.slice(0, -1),
        playerHistory: state.playerHistory.slice(0, -1),
        checkersOnBarHistory: state.checkersOnBarHistory.slice(0, -1),
        checkersBorneOffHistory: state.checkersBorneOffHistory.slice(0, -1),
        potentialMovesHistory: state.potentialMovesHistory.slice(0, -1),
        selectedSpot: null,
        potentialSpots: [],
      };
    },

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
    loadFromURL: createLoadFromURL((newState) => ({
      ...newState,
      potentialMoves: newState.diceValue ?
        findPotentialMoves(newState.points, newState.player, newState.diceValue, newState.checkersOnBar) : {},
      selectedSpot: null,
      potentialSpots: []
    })),
    saveToURL: createSaveToURL([
      'pointsHistory', 'diceHistory', 'playerHistory',
      'checkersOnBarHistory', 'checkersBorneOffHistory', 'potentialMovesHistory'
    ]),
  },
});

function updateMoveCheckerState(state, fromIndex, toIndex, moveDistance) {
  const { updatedPoints, hasBarPlayer } = moveCheckers(
    state.points,
    toIndex, fromIndex,
    state.player
  );

  const updatedCheckersOnBar = { ...state.checkersOnBar };
  const updatedCheckersBorneOff = { ...state.checkersBorneOff };

  if (hasBarPlayer) {
    updatedCheckersOnBar[hasBarPlayer] = (state.checkersOnBar[hasBarPlayer] || 0) + 1;
  }
  if (fromIndex === INVALID_INDEX) {
    updatedCheckersOnBar[state.player] = (state.checkersOnBar[state.player] || 1) - 1;
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
  const winner = checkWinner(updatedCheckersBorneOff, state.player);

  return {
    ...state,
    points: updatedPoints,
    checkersOnBar: updatedCheckersOnBar,
    checkersBorneOff: updatedCheckersBorneOff,
    winner,
    diceValue: moveInProcess && !winner ? updatedDiceValue : null,
    player: moveInProcess && !winner ? state.player : winner ? null : togglePlayer(state.player),
    potentialMoves: moveInProcess && !winner ? updatedPotentialMoves : {},
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

export const { makeMove, rollDice, undoRoll, togglePlayerRoll, resetGame, selectSpot, loadTestBoard, setCustomDice, loadFromURL, saveToURL } = backgammonSlice.actions;

export default backgammonSlice.reducer;
