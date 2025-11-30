/* globals jest, beforeEach, describe, expect, it */
import { configureStore } from '@reduxjs/toolkit';
import backgammonReducer, { backgammonInitialState, selectSpot, rollDice, makeMove, resetGame, undoRoll } from './slice';
import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';
import * as gameLogic from './gameLogic';

jest.mock('./gameLogic', () => ({
  ...jest.requireActual('./gameLogic'),
  rollDie: jest.fn(),
  rollDiceLogic: jest.fn(),
}));

describe('Backgammon Slice', () => {
  let store;
  let state;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({ reducer: backgammonReducer });
    state = store.getState();
  });

  it('should initialize with the correct state', () => {
    expect(state).toEqual(backgammonInitialState);
  });

  it('should select spot with dice roll 2 3', () => {
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER_RIGHT });
    // Roll the dice for the current turn
    store.dispatch(rollDice());

    // Select spot 24 after rolling dice
    store.dispatch(selectSpot(24));
    state = store.getState()
    expect(state.potentialSpots).toEqual([22,21])
    store.dispatch(selectSpot(5))
    state = store.getState()
    expect(state.potentialSpots).toEqual([7,8])
    store.dispatch(selectSpot(13))
    state = store.getState()
    expect(state.potentialSpots).toEqual([2,3])
  });


  it('should select spot with dice roll 3 2', () => {
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [3, 2], player: PLAYER_LEFT });
    store.dispatch(rollDice())
    store.dispatch(selectSpot(12))
    state = store.getState()
    expect(state.potentialSpots).toEqual([9,10])
    store.dispatch(selectSpot(1))
    state = store.getState()
    expect(state.potentialSpots).toEqual([15,14])
    store.dispatch(selectSpot(17))
    state = store.getState()
    expect(state.potentialSpots).toEqual([20,19])
  });


  it('should handle doubles roll', () => {
    // first roll of the game cannot be doubles
    expect(state.player).toBe(null);
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYER_LEFT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYER_LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 } ))
    state = store.getState()
    expect(state.player).toBe(PLAYER_RIGHT);
    // doubles roll
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 4, 4, 4], player: PLAYER_RIGHT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 } ))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 } ))
    state = store.getState()
    expect(state.player).toBe(PLAYER_LEFT);
  });

  it('should move left player to checker to bar', () => {
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 2], player: PLAYER_LEFT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYER_LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState()
    expect(state.player).toBe(PLAYER_RIGHT);
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 1], player: PLAYER_RIGHT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    state = store.getState()
    expect(state.checkersOnBar[PLAYER_LEFT]).toEqual(1);
  });

  it('should move right player to checker to bar', () => {
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 6], player: PLAYER_RIGHT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYER_RIGHT);
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    state = store.getState()
    expect(state.player).toBe(PLAYER_LEFT);
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 1], player: PLAYER_LEFT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState()
    expect(state.checkersOnBar[PLAYER_RIGHT]).toEqual(1);
  });

  it('should move right player checker to bar back to board', () => {
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 6], player: PLAYER_RIGHT });
    store.dispatch(rollDice())
    state = store.getState();
    expect(state.player).toBe(PLAYER_RIGHT);
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 2], player: PLAYER_LEFT });
    store.dispatch(rollDice())
    state = store.getState();
    expect(state.player).toBe(PLAYER_LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState();
    expect(state.checkersOnBar[PLAYER_RIGHT]).toEqual(1);
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [3, 2], player: PLAYER_RIGHT });
    store.dispatch(rollDice())
    store.dispatch(selectSpot(22))
    state = store.getState();
    expect(state.points[22].player).toEqual(PLAYER_RIGHT);
    expect(state.checkersOnBar[PLAYER_RIGHT]).toEqual(0);
  });

  it('should roll and reset dice', () => {
    const [ leftDie, rightDie ] = [ 5, 3 ]
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [leftDie, rightDie], player: PLAYER_LEFT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.diceValue).toEqual([leftDie, rightDie]);
    store.dispatch(resetGame())
    state = store.getState()
    expect(state.diceValue).toBe(null)
  });

  it('should not allow moves without a dice roll', () => {
    expect(state.player).toEqual(null)
    store.dispatch(makeMove( { fromPointId: 1, toPointId: 2 } ))
    state = store.getState()
    expect(state.player).toEqual(null)
    expect(state.points[0].checkers).toBe(5);
  });

  it('should roll and update the history correctly', () => {
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYER_LEFT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }))
    state = store.getState()
    expect(state.pointsHistory).toHaveLength(1);
    expect(state.diceHistory).toHaveLength(1);
    expect(state.playerHistory).toHaveLength(1);
    expect(state.playerHistory[0]).toEqual(state.player);
    expect(state.potentialMovesHistory).toHaveLength(1);
    expect(state.potentialMovesHistory[0]).toEqual({1: [18, 15], 12: [6, 9], 17: [23, 20], 19: [22]})
    expect(state.checkersOnBarHistory[0][PLAYER_LEFT]).toEqual(0);
    expect(state.checkersOnBarHistory[0][PLAYER_RIGHT]).toEqual(0);
  });

  it('should should set the dice manually on first roll if doubles are rolled 10 times in a row', () => {
    const diceError = jest.spyOn(console, 'error').mockImplementation();
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 2], player: PLAYER_LEFT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(gameLogic.rollDiceLogic).toHaveBeenCalledTimes(1);
    expect(state.diceValue).toEqual([1, 2]);
  });

  it('should handle undo with no history', () => {
    store.dispatch(undoRoll())
    state = store.getState()
    expect(state).toEqual(backgammonInitialState);
  });
});