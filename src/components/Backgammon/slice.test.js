import { configureStore } from '@reduxjs/toolkit';
import backgammonReducer, { initialState, selectSpot, rollDice, makeMove, resetGame, undoRoll, offerDouble, acceptDouble, declineDouble, endTurn } from './slice';
import { PLAYERS } from './globals';
import * as gamePlay from './gamePlay';

jest.mock('./gamePlay', () => ({
  ...jest.requireActual('./gamePlay'),
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
    expect(state).toEqual(initialState);
  });

  it('should select spot with dice roll 2 3', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYERS.RIGHT });
    store.dispatch(rollDice());
    store.dispatch(selectSpot(24));
    state = store.getState()
    expect(state.potentialSpots).toEqual([22, 21])
    store.dispatch(selectSpot(5))
    state = store.getState()
    expect(state.potentialSpots).toEqual([7, 8])
    store.dispatch(selectSpot(13))
    state = store.getState()
    expect(state.potentialSpots).toEqual([2, 3])
  });


  it('should select spot with dice roll 3 2', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [3, 2], player: PLAYERS.LEFT });
    store.dispatch(rollDice())
    store.dispatch(selectSpot(12))
    state = store.getState()
    expect(state.potentialSpots).toEqual([9, 10])
    store.dispatch(selectSpot(1))
    state = store.getState()
    expect(state.potentialSpots).toEqual([15, 14])
    store.dispatch(selectSpot(17))
    state = store.getState()
    expect(state.potentialSpots).toEqual([20, 19])
  });


  it('should handle doubles roll', () => {
    // first roll of the game cannot be doubles
    expect(state.player).toBe(null);
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYERS.LEFT });
    store.dispatch(rollDice())
    // make moves for left player
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    // doubles roll for right player
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 4, 4, 4], player: PLAYERS.RIGHT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    state = store.getState()
    expect(state.turnEnding).toBe(true);
    expect(state.player).toBe(PLAYERS.RIGHT);
  });

  it('should move left player to checker to bar', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 2], player: PLAYERS.LEFT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYERS.LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState()
    expect(state.turnEnding).toBe(true);
    expect(state.player).toBe(PLAYERS.LEFT);
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 1], player: PLAYERS.RIGHT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    state = store.getState()
    expect(state.checkersOnBar[PLAYERS.LEFT]).toEqual(1);
  });

  it('should move right player to checker to bar', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 6], player: PLAYERS.RIGHT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYERS.RIGHT);
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    state = store.getState()
    expect(state.turnEnding).toBe(true);
    expect(state.player).toBe(PLAYERS.RIGHT);
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 1], player: PLAYERS.LEFT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState()
    expect(state.checkersOnBar[PLAYERS.RIGHT]).toEqual(1);
  });

  it('should move right player checker to bar back to board', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 6], player: PLAYERS.RIGHT });
    store.dispatch(rollDice())
    state = store.getState();
    expect(state.player).toBe(PLAYERS.RIGHT);
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 2], player: PLAYERS.LEFT });
    store.dispatch(rollDice())
    state = store.getState();
    expect(state.player).toBe(PLAYERS.LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState();
    expect(state.checkersOnBar[PLAYERS.RIGHT]).toEqual(1);
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [3, 2], player: PLAYERS.RIGHT });
    store.dispatch(rollDice())
    store.dispatch(selectSpot(22))
    state = store.getState();
    expect(state.points[22].player).toEqual(PLAYERS.RIGHT);
    expect(state.checkersOnBar[PLAYERS.RIGHT]).toEqual(0);
  });

  it('should roll and reset dice', () => {
    const [leftDie, rightDie] = [5, 3]
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [leftDie, rightDie], player: PLAYERS.LEFT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.diceValue).toEqual([leftDie, rightDie]);
    store.dispatch(resetGame())
    state = store.getState()
    expect(state.diceValue).toBe(null)
  });

  it('should not allow moves without a dice roll', () => {
    expect(state.player).toEqual(null)
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 2 }))
    state = store.getState()
    expect(state.player).toEqual(null)
    expect(state.points[0].checkers).toBe(5);
  });

  it('should roll and update the history correctly', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYERS.LEFT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }))
    state = store.getState()
    expect(state.pointsHistory).toHaveLength(1);
    expect(state.diceHistory).toHaveLength(1);
    expect(state.playerHistory).toHaveLength(1);
    expect(state.playerHistory[0]).toEqual(state.player);
    expect(state.potentialMovesHistory).toHaveLength(1);
    expect(state.potentialMovesHistory[0]).toEqual({ 1: [18, 15], 12: [6, 9], 17: [23, 20], 19: [22] })
    expect(state.checkersOnBarHistory[0][PLAYERS.LEFT]).toEqual(0);
    expect(state.checkersOnBarHistory[0][PLAYERS.RIGHT]).toEqual(0);
  });

  it('should should set the dice manually on first roll if doubles are rolled 10 times in a row', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 2], player: PLAYERS.LEFT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(gamePlay.rollDiceLogic).toHaveBeenCalledTimes(1);
    expect(state.diceValue).toEqual([1, 2]);
  });

  it('should handle undo with no history', () => {
    store.dispatch(undoRoll())
    state = store.getState()
    expect(state).toEqual(initialState);
  });

  it('should set turnEnding to true when all dice are used', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYERS.LEFT });
    store.dispatch(rollDice());
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }));
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }));
    state = store.getState();
    expect(state.turnEnding).toBe(true);
    expect(state.player).toBe(PLAYERS.LEFT);
  });

  it('should end turn and switch players', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYERS.LEFT });
    store.dispatch(rollDice());
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }));
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }));
    state = store.getState();
    expect(state.turnEnding).toBe(true);
    store.dispatch(endTurn());
    state = store.getState();
    expect(state.turnEnding).toBe(false);
    expect(state.player).toBe(PLAYERS.RIGHT);
    expect(state.diceValue).toBe(null);
  });

  describe('Doubling Cube', () => {
    it('should initialize with value 1 and no owner', () => {
      expect(state.doublingCube.value).toBe(1);
      expect(state.doublingCube.owner).toBeNull();
      expect(state.doublingCube.pendingOffer).toBeNull();
    });

    it('should allow player to offer double', () => {
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYERS.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      const newState = store.getState();
      expect(newState.doublingCube.pendingOffer).toBe(PLAYERS.LEFT);
    });

    it('should double the value when accepted', () => {
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYERS.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      // Switch to the other player to accept the double
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 5], player: PLAYERS.RIGHT });
      store.dispatch(rollDice());
      store.dispatch(acceptDouble());
      const newState = store.getState();
      expect(newState.doublingCube.value).toBe(2);
      expect(newState.doublingCube.owner).toBe(PLAYERS.RIGHT);
      expect(newState.doublingCube.pendingOffer).toBeNull();
    });

    it('should end game when double is declined', () => {
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYERS.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      store.dispatch(declineDouble());
      const newState = store.getState();
      expect(newState.winner).toBe(PLAYERS.LEFT);
      expect(newState.gamesWon[PLAYERS.LEFT]).toBe(1);
    });
  });
});
