import { createSlice } from '@reduxjs/toolkit';
import { initializeBoard, getPointIdToIndexMap } from './boardUtils';
import { togglePlayer, checkWinner, rollDiceLogic, selectSpotLogic } from './gamePlay';
import { findPotentialMoves, moveCheckers, validateBearOffMove } from './moveLogic';
import { PLAYER, BOARD_CONFIG } from './globals';
import { sendMultiplayerMove, createMultiplayerReducers } from '@/utils/multiplayerUtils';

export const initialState = {
  points: initializeBoard(),
  checkersOnBar: { [PLAYER.LEFT]: 0, [PLAYER.RIGHT]: 0 },
  checkersBorneOff: { [PLAYER.LEFT]: 0, [PLAYER.RIGHT]: 0 },
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
  gamesWon: { [PLAYER.LEFT]: 0, [PLAYER.RIGHT]: 0 },
  doublingCube: {
    value: 1,
    owner: null,
    pendingOffer: null
  },
  turnEnding: false,
  isMultiplayer: null,
  myPlayer: null,
  isMyTurn: false,
  gameStarted: false,
};

export const slice = createSlice({
  name: 'backgammon',
  initialState,
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

    makeMove: (state, action) => reduceMakeMove(state, action),

    rollDice: (state) => {
      // Prevent rolling if it's multiplayer and not the player's turn
      if (state.isMultiplayer && !state.isMyTurn) {
        return state;
      }

      const { diceValue, player } = rollDiceLogic(state.player);
      const potentialMoves = findPotentialMoves(state.points, player, diceValue, state.checkersOnBar);

      const newState = {
        ...state,
        diceValue,
        player,
        potentialMoves,
        selectedSpot: null,
        potentialSpots: []
      };

      // Send to WebSocket if multiplayer
      if (state.isMultiplayer) {
        sendMultiplayerMove('backgammon', newState);
      }

      return newState;
    },

    undoRoll: (state) => {
      const previousActionState = {
        points: state.pointsHistory[state.pointsHistory.length - 1] || initialState.points,
        diceValue: state.diceHistory[state.diceHistory.length - 1] || initialState.diceValue,
        player: state.playerHistory[state.playerHistory.length - 1] || initialState.player,
        potentialMoves: state.potentialMovesHistory[state.potentialMovesHistory.length - 1] || initialState.potentialMoves,
        checkersOnBar: state.checkersOnBarHistory[state.checkersOnBarHistory.length - 1] || initialState.checkersOnBar,
        checkersBorneOff: state.checkersBorneOffHistory[state.checkersBorneOffHistory.length - 1] || initialState.checkersBorneOff,
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

    resetGame: (state) => ({ ...initialState, points: initializeBoard(), gamesWon: state.gamesWon }),

    playAgain: (state) => ({
      ...initialState,
      points: initializeBoard(),
      gamesWon: state.gamesWon,
      isMultiplayer: state.isMultiplayer,
      myPlayer: state.myPlayer,
      isMyTurn: state.isMultiplayer ? state.myPlayer === PLAYER.LEFT : true
    }),

    setCustomDice: (state, action) => ({
      ...state,
      diceValue: action.payload,
      potentialMoves: state.player ?
        findPotentialMoves(state.points, state.player, action.payload, state.checkersOnBar) : {}
    }),

    offerDouble: (state) => {
      if (state.doublingCube.owner === state.player || state.doublingCube.pendingOffer) return state;
      const newState = {
        ...state,
        doublingCube: {
          ...state.doublingCube,
          pendingOffer: state.player
        }
      };

      // Send to WebSocket if multiplayer
      if (state.isMultiplayer) {
        sendMultiplayerMove('backgammon', newState);
      }

      return newState;
    },

    acceptDouble: (state) => {
      if (!state.doublingCube.pendingOffer) return state;
      const offeringPlayer = state.doublingCube.pendingOffer;
      const newState = {
        ...state,
        doublingCube: {
          value: state.doublingCube.value * 2,
          owner: state.player,
          pendingOffer: null
        },
        player: offeringPlayer,
        diceValue: null,
        selectedSpot: null,
        potentialSpots: [],
        potentialMoves: {}
      };

      if (state.isMultiplayer) {
        sendMultiplayerMove('backgammon', newState);
      }

      return newState;
    },

    declineDouble: (state) => {
      if (!state.doublingCube.pendingOffer) return state;
      const offeringPlayer = state.doublingCube.pendingOffer;
      const newState = {
        ...state,
        winner: offeringPlayer,
        gamesWon: {
          ...state.gamesWon,
          [offeringPlayer]: state.gamesWon[offeringPlayer] + state.doublingCube.value
        },
        doublingCube: {
          value: 1,
          owner: null,
          pendingOffer: null
        },
        turnEnding: false
      };

      if (state.isMultiplayer) {
        sendMultiplayerMove('backgammon', newState);
      }

      return newState;
    },

    endTurn: (state) => {
      const newState = {
        ...state,
        player: togglePlayer(state.player),
        diceValue: null,
        turnEnding: false,
        selectedSpot: null,
        potentialSpots: [],
        potentialMoves: {},
        isMyTurn: state.isMultiplayer ? state.myPlayer === togglePlayer(state.player) : true
      };

      if (state.isMultiplayer) {
        sendMultiplayerMove('backgammon', newState);
      }

      return newState;
    },

    setMultiplayerMode: createMultiplayerReducers().setMultiplayerMode,
    makeMultiplayerMove: createMultiplayerReducers().makeMultiplayerMove,
    syncGameState: createMultiplayerReducers().syncGameState,

    startGame: (state) => {
      const { diceValue, player } = rollDiceLogic(null);
      const potentialMoves = findPotentialMoves(state.points, player, diceValue, state.checkersOnBar);

      const newState = {
        ...state,
        gameStarted: true,
        diceValue,
        player,
        potentialMoves,
        isMyTurn: state.isMultiplayer ? state.myPlayer === player : true
      };

      if (state.isMultiplayer) {
        sendMultiplayerMove('backgammon', newState);
      }

      return newState;
    },
  },
});

const reduceMakeMove = (state, { payload: { fromPointId, toPointId } }) => {
  const { player, diceValue, points } = state;
  if (!player || !diceValue?.length) return state;

  // Prevent moves if it's multiplayer and not the player's turn
  if (state.isMultiplayer && !state.isMyTurn) {
    return state;
  }

  const fromIndex = points.findIndex(point => point.id === fromPointId);
  if (fromIndex === -1 || points[fromIndex].checkers < 1) return state;

  // Bear off move
  if (toPointId === -1) {
    const { isValid, usedDiceValue } = validateBearOffMove(player, fromPointId, diceValue, points);
    return isValid ? updateMoveCheckerState(state, fromIndex, -1, usedDiceValue) : state;
  }

  // point to point move
  const toIndex = points.findIndex(point => point.id === toPointId);
  if (toIndex === -1) return state;

  const pointKey = getPointIdToIndexMap(player);
  const moveDistance = Math.abs(pointKey[toIndex] - pointKey[fromIndex]);

  if (!diceValue.includes(moveDistance) || pointKey[toIndex] <= pointKey[fromIndex]) {
    return state;
  }
  return updateMoveCheckerState(state, fromIndex, toIndex, moveDistance);
};

const updateMoveCheckerState = (state, fromIndex, toIndex, moveDistance) => {
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
  if (fromIndex === -1) {
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
  const gameValue = state.doublingCube.value;
  const updatedGamesWon = winner ? { ...state.gamesWon, [winner]: state.gamesWon[winner] + gameValue } : state.gamesWon;
  const turnShouldEnd = !moveInProcess && !winner;

  const newState = {
    ...state,
    points: updatedPoints,
    checkersOnBar: updatedCheckersOnBar,
    checkersBorneOff: updatedCheckersBorneOff,
    winner,
    gamesWon: updatedGamesWon,
    diceValue: moveInProcess && !winner ? updatedDiceValue : null,
    player: winner ? null : state.player,
    potentialMoves: moveInProcess && !winner ? updatedPotentialMoves : {},
    turnEnding: turnShouldEnd,
    selectedSpot: null,
    potentialSpots: [],
    pointsHistory: [...state.pointsHistory, state.points].slice(-BOARD_CONFIG.MAX_HISTORY),
    checkersOnBarHistory: [...state.checkersOnBarHistory, state.checkersOnBar].slice(-BOARD_CONFIG.MAX_HISTORY),
    checkersBorneOffHistory: [...state.checkersBorneOffHistory, state.checkersBorneOff].slice(-BOARD_CONFIG.MAX_HISTORY),
    diceHistory: [...state.diceHistory, state.diceValue].slice(-BOARD_CONFIG.MAX_HISTORY),
    playerHistory: [...state.playerHistory, state.player].slice(-BOARD_CONFIG.MAX_HISTORY),
    potentialMovesHistory: [...state.potentialMovesHistory, state.potentialMoves].slice(-BOARD_CONFIG.MAX_HISTORY),
  };

  if (state.isMultiplayer) {
    sendMultiplayerMove('backgammon', newState);
  }

  return newState;
}

export const {
  makeMove,
  playAgain,
  resetGame,
  rollDice,
  selectSpot,
  setCustomDice,
  togglePlayerRoll,
  undoRoll,
  offerDouble,
  acceptDouble,
  declineDouble,
  endTurn,
  setMultiplayerMode,
  makeMultiplayerMove,
  syncGameState,
  startGame
} = slice.actions;

export default slice.reducer;
