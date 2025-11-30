/* globals jest, beforeEach, describe, expect, it */
import { configureStore } from '@reduxjs/toolkit';
import backgammonReducer, { backgammonInitialState, selectSpot, rollDice, makeMove, resetGame, undoRoll } from './slice';
import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';
import * as gameLogic from './gameLogic';

jest.mock('./gameLogic', () => ({
  ...jest.requireActual('./gameLogic'),
  rollDie: jest.fn(),
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
    gameLogic.rollDie.mockReturnValueOnce(2).mockReturnValueOnce(3);
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
    gameLogic.rollDie.mockReturnValueOnce(3).mockReturnValueOnce(2);
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
    gameLogic.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(3);
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYER_LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 } ))
    state = store.getState()
    expect(state.player).toBe(PLAYER_RIGHT);
    // doubles roll
    gameLogic.rollDie.mockReturnValueOnce(4).mockReturnValueOnce(4);
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 } ))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 } ))
    state = store.getState()
    expect(state.player).toBe(PLAYER_LEFT);
  });

  it('should move left player to checker to bar', () => {
    gameLogic.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(2);
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYER_LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState()
    expect(state.player).toBe(PLAYER_RIGHT);
    gameLogic.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(1);
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    state = store.getState()
    expect(state.checkersOnBar[PLAYER_LEFT]).toEqual(1);
  });

  it('should move right player to checker to bar', () => {
    gameLogic.rollDie.mockReturnValueOnce(1).mockReturnValueOnce(6);
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYER_RIGHT);
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    state = store.getState()
    expect(state.player).toBe(PLAYER_LEFT);
    gameLogic.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(1);
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState()
    expect(state.checkersOnBar[PLAYER_RIGHT]).toEqual(1);
  });

  it('should move right player checker to bar back to board', () => {
    gameLogic.rollDie.mockReturnValueOnce(1).mockReturnValueOnce(6);
    store.dispatch(rollDice())
    state = store.getState();
    expect(state.player).toBe(PLAYER_RIGHT);
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    gameLogic.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(2);
    store.dispatch(rollDice())
    state = store.getState();
    expect(state.player).toBe(PLAYER_LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState();
    expect(state.checkersOnBar[PLAYER_RIGHT]).toEqual(1);
    gameLogic.rollDie.mockReturnValueOnce(3).mockReturnValueOnce(2);
    store.dispatch(rollDice())
    store.dispatch(selectSpot(22))
    state = store.getState();
    expect(state.points[22].player).toEqual(PLAYER_RIGHT);
    expect(state.checkersOnBar[PLAYER_RIGHT]).toEqual(0);
  });

  it('should roll and reset dice', () => {
    const [ leftDie, rightDie ] = [ 5, 3 ]
    gameLogic.rollDie.mockReturnValueOnce(leftDie).mockReturnValueOnce(rightDie);
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
    gameLogic.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(3);
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
    for (let i = 0; i < 10; i++) {
      gameLogic.rollDie.mockReturnValueOnce(1).mockReturnValueOnce(1);
    }
    store.dispatch(rollDice())
    state = store.getState()
    expect(gameLogic.rollDie).toHaveBeenCalledTimes(22);
    expect(state.diceValue).toEqual([1, 2]);
    expect(diceError.mock.calls[0][0]).toContain('Roll Error')
  });

  it('should handle undo with no history', () => {
    store.dispatch(undoRoll())
    state = store.getState()
    expect(state).toEqual(backgammonInitialState);
  });
});
