import { configureStore } from '@reduxjs/toolkit';
import backgammonReducer, { initialState, selectSpot, rollDice, makeMove, resetGame, undoRoll, offerDouble, acceptDouble, declineDouble, endTurn, togglePlayerRoll, setMultiplayerMode, playAgain } from './slice';
import { PLAYER } from './globals';
import * as gamePlay from './gamePlay';
import { sendMultiplayerMove } from '@/components/Multiplayer/multiplayerUtils';

jest.mock('./gamePlay', () => ({
  ...jest.requireActual('./gamePlay'),
  rollDiceLogic: jest.fn(),
}));

jest.mock('@/components/Multiplayer/multiplayerUtils', () => ({
  sendMultiplayerMove: jest.fn(),
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
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.RIGHT });
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
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [3, 2], player: PLAYER.LEFT });
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
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYER.LEFT });
    store.dispatch(rollDice())
    // make moves for left player
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    // doubles roll for right player
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 4, 4, 4], player: PLAYER.RIGHT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    store.dispatch(makeMove({ fromPointId: 13, toPointId: 4 }))
    state = store.getState()
    expect(state.turnEnding).toBe(true);
    expect(state.player).toBe(PLAYER.RIGHT);
  });

  it('should move left player to checker to bar', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 2], player: PLAYER.LEFT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYER.LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState()
    expect(state.turnEnding).toBe(true);
    expect(state.player).toBe(PLAYER.LEFT);
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 1], player: PLAYER.RIGHT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    state = store.getState()
    expect(state.checkersOnBar[PLAYER.LEFT]).toEqual(1);
  });

  it('should move right player to checker to bar', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 6], player: PLAYER.RIGHT });
    store.dispatch(rollDice())
    state = store.getState()
    expect(state.player).toBe(PLAYER.RIGHT);
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    state = store.getState()
    expect(state.turnEnding).toBe(true);
    expect(state.player).toBe(PLAYER.RIGHT);
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 1], player: PLAYER.LEFT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState()
    expect(state.checkersOnBar[PLAYER.RIGHT]).toEqual(1);
  });

  it('should move right player checker to bar back to board', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 6], player: PLAYER.RIGHT });
    store.dispatch(rollDice())
    state = store.getState();
    expect(state.player).toBe(PLAYER.RIGHT);
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 18 }))
    store.dispatch(makeMove({ fromPointId: 24, toPointId: 23 }))
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 2], player: PLAYER.LEFT });
    store.dispatch(rollDice())
    state = store.getState();
    expect(state.player).toBe(PLAYER.LEFT);
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 14 }))
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }))
    state = store.getState();
    expect(state.checkersOnBar[PLAYER.RIGHT]).toEqual(1);
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [3, 2], player: PLAYER.RIGHT });
    store.dispatch(rollDice())
    store.dispatch(selectSpot(22))
    state = store.getState();
    expect(state.points[22].player).toEqual(PLAYER.RIGHT);
    expect(state.checkersOnBar[PLAYER.RIGHT]).toEqual(0);
  });

  it('should roll and reset dice', () => {
    const [leftDie, rightDie] = [5, 3]
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [leftDie, rightDie], player: PLAYER.LEFT });
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
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYER.LEFT });
    store.dispatch(rollDice())
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }))
    state = store.getState()
    expect(state.pointsHistory).toHaveLength(1);
    expect(state.diceHistory).toHaveLength(1);
    expect(state.playerHistory).toHaveLength(1);
    expect(state.playerHistory[0]).toEqual(state.player);
    expect(state.potentialMovesHistory).toHaveLength(1);
    expect(state.potentialMovesHistory[0]).toEqual({ 1: [18, 15], 12: [6, 9], 17: [23, 20], 19: [22] })
    expect(state.checkersOnBarHistory[0][PLAYER.LEFT]).toEqual(0);
    expect(state.checkersOnBarHistory[0][PLAYER.RIGHT]).toEqual(0);
  });

  it('should should set the dice manually on first roll if doubles are rolled 10 times in a row', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 2], player: PLAYER.LEFT });
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
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYER.LEFT });
    store.dispatch(rollDice());
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }));
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }));
    state = store.getState();
    expect(state.turnEnding).toBe(true);
    expect(state.player).toBe(PLAYER.LEFT);
  });

  it('should end turn and switch players', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYER.LEFT });
    store.dispatch(rollDice());
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }));
    store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }));
    state = store.getState();
    expect(state.turnEnding).toBe(true);
    store.dispatch(endTurn());
    state = store.getState();
    expect(state.turnEnding).toBe(false);
    expect(state.player).toBe(PLAYER.RIGHT);
    expect(state.diceValue).toBe(null);
  });

  it('togglePlayerRoll broadcasts the turn switch in multiplayer (no legal move)', () => {
    // A no-legal-move turn end must reach the opponent, or the clients desync.
    store.dispatch(setMultiplayerMode({ isMultiplayer: true, myPlayer: PLAYER.LEFT }));
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.LEFT });
    store.dispatch(rollDice());
    sendMultiplayerMove.mockClear(); // discard the rollDice broadcast

    store.dispatch(togglePlayerRoll());
    state = store.getState();

    expect(state.player).toBe(PLAYER.RIGHT);
    expect(state.diceValue).toBeNull();
    expect(state.isMyTurn).toBe(false);
    expect(sendMultiplayerMove).toHaveBeenCalledWith(
      'backgammon',
      expect.objectContaining({ player: PLAYER.RIGHT, diceValue: null })
    );
  });

  it('togglePlayerRoll does not broadcast in local play', () => {
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.LEFT });
    store.dispatch(rollDice());
    store.dispatch(togglePlayerRoll());
    state = store.getState();

    expect(state.player).toBe(PLAYER.RIGHT);
    expect(sendMultiplayerMove).not.toHaveBeenCalled();
  });

  it('playAgain broadcasts a full reset in multiplayer', () => {
    // Without the broadcast, the opponent is stuck on the winner screen.
    store.dispatch(setMultiplayerMode({ isMultiplayer: true, myPlayer: PLAYER.LEFT }));
    sendMultiplayerMove.mockClear();

    store.dispatch(playAgain());
    state = store.getState();

    expect(state.gameStarted).toBe(false);
    expect(state.winner).toBeNull();
    expect(state.player).toBeNull();
    expect(sendMultiplayerMove).toHaveBeenCalledWith(
      'backgammon',
      expect.objectContaining({
        winner: null,
        player: null,
        gameStarted: false,
        doublingCube: { value: 1, owner: null, pendingOffer: null },
      })
    );
  });

  it('playAgain does not broadcast in local play', () => {
    // Local playAgain rolls immediately to start the next game.
    gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.LEFT });
    store.dispatch(setMultiplayerMode({ isMultiplayer: false }));
    sendMultiplayerMove.mockClear();

    store.dispatch(playAgain());

    expect(sendMultiplayerMove).not.toHaveBeenCalled();
  });

  describe('Doubling Cube', () => {
    it('should initialize with value 1 and no owner', () => {
      expect(state.doublingCube.value).toBe(1);
      expect(state.doublingCube.owner).toBeNull();
      expect(state.doublingCube.pendingOffer).toBeNull();
    });

    it('should allow player to offer double', () => {
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      const newState = store.getState();
      expect(newState.doublingCube.pendingOffer).toBe(PLAYER.LEFT);
    });

    it('should double the value when accepted', () => {
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      // Switch to the other player to accept the double
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 5], player: PLAYER.RIGHT });
      store.dispatch(rollDice());
      store.dispatch(acceptDouble());
      const newState = store.getState();
      expect(newState.doublingCube.value).toBe(2);
      expect(newState.doublingCube.owner).toBe(PLAYER.RIGHT);
      expect(newState.doublingCube.pendingOffer).toBeNull();
    });

    it('assigns cube ownership to the accepter even if accepted before the turn ends', () => {
      // The top-level DoubleOffer accept isn't turn-gated, so accept can fire while the offerer is still current.
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      // Accept without switching turns first: state.player is still LEFT.
      store.dispatch(acceptDouble());
      const newState = store.getState();
      expect(newState.player).toBe(PLAYER.RIGHT); // accepter plays next
      expect(newState.doublingCube.owner).toBe(PLAYER.RIGHT); // accepter owns it
      expect(newState.doublingCube.value).toBe(2);
    });

    it('lets the cube owner offer the next double', () => {
      // L offers from centered, R takes -> R owns the cube.
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 5], player: PLAYER.RIGHT });
      store.dispatch(rollDice());
      store.dispatch(acceptDouble());
      expect(store.getState().doublingCube.owner).toBe(PLAYER.RIGHT);

      // R, the owner, may redouble on their turn.
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 2], player: PLAYER.RIGHT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      expect(store.getState().doublingCube.pendingOffer).toBe(PLAYER.RIGHT);
    });

    it('prevents the non-owner from offering a double', () => {
      // L offers from centered, R takes -> R owns the cube and is on roll.
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 5], player: PLAYER.RIGHT });
      store.dispatch(rollDice());
      store.dispatch(acceptDouble());
      expect(store.getState().doublingCube.owner).toBe(PLAYER.RIGHT);

      // Move to LEFT, who does not own the cube: the offer must be rejected.
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 2], player: PLAYER.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      expect(store.getState().doublingCube.pendingOffer).toBeNull();
    });

    it('gives the turn to the accepter after a take, not back to the offerer', () => {
      // acceptDouble used to return the turn to the offerer, skipping the accepter who just paid double.
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYER.LEFT });
      store.dispatch(rollDice());
      store.dispatch(makeMove({ fromPointId: 1, toPointId: 15 }));
      store.dispatch(makeMove({ fromPointId: 1, toPointId: 18 }));
      expect(store.getState().turnEnding).toBe(true);

      store.dispatch(offerDouble());  // LEFT offers at end of its turn
      store.dispatch(endTurn());      // pass control to RIGHT to respond
      store.dispatch(acceptDouble()); // RIGHT takes the cube

      const s = store.getState();
      expect(s.player).toBe(PLAYER.RIGHT);   // accepter plays next
      expect(s.turnEnding).toBe(false);      // clean turn, so RIGHT sees "Roll"
      expect(s.diceValue).toBeNull();
    });

    it('should end game when double is declined', () => {
      gamePlay.rollDiceLogic.mockReturnValueOnce({ diceValue: [2, 3], player: PLAYER.LEFT });
      store.dispatch(rollDice());
      store.dispatch(offerDouble());
      store.dispatch(declineDouble());
      const newState = store.getState();
      expect(newState.winner).toBe(PLAYER.LEFT);
      expect(newState.gamesWon[PLAYER.LEFT]).toBe(1);
    });
  });
});
