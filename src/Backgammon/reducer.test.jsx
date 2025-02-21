import { reducer, initialState } from './reducer';
import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';
import {
  SELECT_SPOT, MOVE_CHECKER,
  ROLL_DICE, RESET, UNDO
} from './actionTypes'
import * as utils from './utils';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  rollDie: jest.fn(),
}));


describe('Backgammon Reducer', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should select spot with dice roll 2 3', () => {
    const state = { ...initialState };
    utils.rollDie.mockReturnValueOnce(2).mockReturnValueOnce(3);
    const rollState = reducer(state, { type: ROLL_DICE });
    const stateSelect24 = reducer(rollState, { type: SELECT_SPOT, payload: 24 });
    expect(stateSelect24.potentialSpots).toEqual([22,21])
    const stateSelect5 = reducer(rollState, { type: SELECT_SPOT, payload: 5 });
    expect(stateSelect5.potentialSpots).toEqual([7,8])
    const stateSelect13 = reducer(rollState, { type: SELECT_SPOT, payload: 13 });
    expect(stateSelect13.potentialSpots).toEqual([2,3])
  });

  it('should select spot with dice roll 3 2', () => {
    const state = { ...initialState };
    utils.rollDie.mockReturnValueOnce(3).mockReturnValueOnce(2);
    const rollState = reducer(state, { type: ROLL_DICE });
    const stateSelect12 = reducer(rollState, { type: SELECT_SPOT, payload: 12 });
    expect(stateSelect12.potentialSpots).toEqual([9,10])
    const stateSelect1 = reducer(rollState, { type: SELECT_SPOT, payload: 1 });
    expect(stateSelect1.potentialSpots).toEqual([15, 14])
    const stateSelect16 = reducer(rollState, { type: SELECT_SPOT, payload: 17 });
    expect(stateSelect16.potentialSpots).toEqual([20,19])
  });

  it('should handle doubles roll', () => {
    // first roll of the game cannot be doubles
    utils.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(3);
    const state = { ...initialState };
    const rollState1 = reducer(state, { type: ROLL_DICE });
    const moveState1 = reducer(rollState1,  { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 15 } });
    const moveState2 = reducer(moveState1, { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 18 } });
    // doubles roll
    utils.rollDie.mockReturnValueOnce(4).mockReturnValueOnce(4);
    const rollState2 = reducer(moveState2, { type: ROLL_DICE });
    expect(rollState2.player).toBe(PLAYER_RIGHT);
    const moveState3 = reducer(rollState2,  { type: MOVE_CHECKER, payload: { fromPointId: 13, toPointId: 4 } });
    const moveState4 = reducer(moveState3,  { type: MOVE_CHECKER, payload: { fromPointId: 13, toPointId: 4 } });
    expect(moveState4.player).toBe(PLAYER_RIGHT);
    const moveState5 = reducer(moveState4,  { type: MOVE_CHECKER, payload: { fromPointId: 13, toPointId: 4 } });
    expect(moveState5.player).toBe(PLAYER_RIGHT);
    const moveState6 = reducer(moveState5,  { type: MOVE_CHECKER, payload: { fromPointId: 13, toPointId: 4 } });
    expect(moveState6.player).toBe(PLAYER_LEFT);
  });

  it('should move left player checker to bar', () => {
    utils.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(2);
    const state = { ...initialState };
    const rollState1 = reducer(state, { type: ROLL_DICE });
    expect(rollState1.player).toBe(PLAYER_LEFT);
    const moveState1 = reducer(rollState1,  { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 14 } });
    const moveState2 = reducer(moveState1, { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 18 } });
    utils.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(1);
    const rollState2 = reducer(moveState2, { type: ROLL_DICE });
    expect(rollState2.player).toBe(PLAYER_RIGHT);
    const moveState3 = reducer(rollState2,  { type: MOVE_CHECKER, payload: { fromPointId: 24, toPointId: 18 } });
    const moveState4 = reducer(moveState3,  { type: MOVE_CHECKER, payload: { fromPointId: 24, toPointId: 23 } });
    expect(moveState4.checkersOnBar[PLAYER_LEFT]).toStrictEqual(1);
    expect(moveState4.checkersOnBar[PLAYER_RIGHT]).toStrictEqual(0);
  });

  it('should move right player checker to bar', () => {
    utils.rollDie.mockReturnValueOnce(1).mockReturnValueOnce(6);
    const state = { ...initialState };
    const rollState1 = reducer(state, { type: ROLL_DICE });
    expect(rollState1.player).toBe(PLAYER_RIGHT);
    const moveState1 = reducer(rollState1,  { type: MOVE_CHECKER, payload: { fromPointId: 24, toPointId: 23 } });
    const moveState2 = reducer(moveState1, { type: MOVE_CHECKER, payload: { fromPointId: 24, toPointId: 18 } });
    utils.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(2);
    const rollState2 = reducer(moveState2, { type: ROLL_DICE });
    expect(rollState2.player).toBe(PLAYER_LEFT);
    const moveState3 = reducer(rollState2,  { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 18 } });
    const moveState4 = reducer(moveState3,  { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 14 } });
    expect(moveState4.checkersOnBar[PLAYER_LEFT]).toStrictEqual(0);
    expect(moveState4.checkersOnBar[PLAYER_RIGHT]).toStrictEqual(1);
  });

  it('should return the initial state when no action is provided', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual(initialState);
  });

  it('should select spot', () => {
    const state = { ...initialState, player: PLAYER_LEFT, diceValue: [1,2]  };
    const actionSelect = { type: SELECT_SPOT, payload: 1 };
    const stateSelect = reducer(state, actionSelect);
    expect(stateSelect.selectedSpot).toBe(1)
  });

  it('should make a move after dice roll then roll for next move', () => {
    utils.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(3);
    const state = reducer({ ...initialState }, { type: ROLL_DICE });
    expect(state.points[0].checkers).toBe(5);
    expect(state.points[13].checkers).toBe(0);
    const actionMove = { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 15 } };
    const stateMove = reducer(state, actionMove);
    expect(stateMove.player).toBe(PLAYER_LEFT);
    expect(stateMove.points[0].checkers).toBe(4);
    expect(stateMove.points[14].checkers).toBe(1);
  });

  it('should make a move as player left and then roll the dice for next move', () => {
    utils.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(3);
    const state = reducer({ ...initialState }, { type: ROLL_DICE });
    expect(state.points[0].checkers).toBe(5);
    expect(state.points[13].checkers).toBe(0);
    const actionMove = { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 15 } };
    const stateMove = reducer(state, actionMove);
    expect(stateMove.player).toBe(PLAYER_LEFT);
    expect(stateMove.points[0].checkers).toBe(4);
    expect(stateMove.points[13].checkers).toBe(0);
    const actionMove2 = { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 18 } };
    const stateMove2 = reducer(stateMove, actionMove2);
    expect(stateMove2.player).toBe(PLAYER_RIGHT);
    expect(stateMove2.diceValue).toEqual(null)
    const stateRoll = reducer(stateMove2, { type: ROLL_DICE });
  });

  it('should make a move as player right and then roll the dice for next move', () => {
    utils.rollDie.mockReturnValueOnce(3).mockReturnValueOnce(6);
    const state = reducer({ ...initialState }, { type: ROLL_DICE });
    expect(state.points[12].checkers).toBe(5);
    expect(state.points[5].checkers).toBe(0);
    expect(state.player).toBe(PLAYER_RIGHT);
    const actionMove = { type: MOVE_CHECKER, payload: { fromPointId: 13, toPointId: 6 } };
    const stateMove = reducer(state, actionMove);
    expect(stateMove.points[12].checkers).toBe(4);
    const actionMove2 = { type: MOVE_CHECKER, payload: { fromPointId: 13, toPointId: 3 } };
    const stateMove2 = reducer(stateMove, actionMove2);
    expect(stateMove2.player).toBe(PLAYER_LEFT);
    expect(stateMove2.diceValue).toEqual(null)
  });

  it('should roll and reset dice', () => {
    const [ leftDie, rightDie ] = [ 5, 3 ]
    utils.rollDie.mockReturnValueOnce(leftDie).mockReturnValueOnce(rightDie);
    const state = { ...initialState };
    const actionRoll = { type: ROLL_DICE };
    const stateRoll = reducer(state, actionRoll);
    expect(stateRoll.diceValue).toEqual([leftDie, rightDie]);
    const actionReset = { type: RESET };
    const stateReset = reducer(stateRoll, actionReset);
    expect(stateReset.diceValue).toBe(null)
  });

  it('should not allow moves without a dice roll', () => {
    const state = { ...initialState  };
    expect(state.player).toEqual(null)
    const actionMove = { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 2 } };
    const stateMove = reducer(state, actionMove);
    expect(stateMove.player).toEqual(null)
    expect(stateMove.points[0].checkers).toBe(5);
  });

  it('should update the history correctly', () => {
    utils.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(3);
    const state = reducer({ ...initialState }, { type: ROLL_DICE });
    const actionMove = { type: MOVE_CHECKER, payload: { fromPointId: 1, toPointId: 15 } };
    const newState = reducer(state, actionMove);
    expect(newState.pointsHistory).toHaveLength(1);
    expect(newState.pointsHistory[0]).toEqual(state.points);
    expect(newState.diceHistory).toHaveLength(1);
    expect(newState.diceHistory[0]).toEqual(state.diceValue);
    expect(newState.playerHistory).toHaveLength(1);
    expect(newState.playerHistory[0]).toEqual(state.player);
    expect(newState.potentialMovesHistory).toHaveLength(1);
    expect(newState.potentialMovesHistory[0]).toEqual({1: [18, 15], 12: [6, 9], 17: [23, 20], 19: [22]})
    expect(newState.checkersOnBarHistory[0]).toStrictEqual(utils.initializeCheckersOnBar());
  });

  it('should should set the dice manually on first roll if doubles are rolled 10 times in a row', () => {
    const diceError = jest.spyOn(console, 'error').mockImplementation();
    utils.rollDie.mockReturnValueOnce(1).mockReturnValueOnce(1)
      .mockReturnValueOnce(1).mockReturnValueOnce(1)
      .mockReturnValueOnce(1).mockReturnValueOnce(1)
      .mockReturnValueOnce(1).mockReturnValueOnce(1)
      .mockReturnValueOnce(1).mockReturnValueOnce(1)
      .mockReturnValueOnce(1).mockReturnValueOnce(1)
      .mockReturnValueOnce(1).mockReturnValueOnce(1)
      .mockReturnValueOnce(1).mockReturnValueOnce(1)
      .mockReturnValueOnce(1).mockReturnValueOnce(1)
      .mockReturnValueOnce(2).mockReturnValueOnce(4);

    const state = reducer(initialState, { type: ROLL_DICE });

    expect(utils.rollDie).toHaveBeenCalledTimes(20);
    expect(state.diceValue).toEqual([1, 2]);
    expect(diceError.mock.calls[0][0]).toContain('Roll Error')
  });

  it('should handle undo with no history', () => {
    const state = { ...initialState, };
    const newState = reducer(state, { type: UNDO });
    expect(newState).toEqual(state);
  });
});
