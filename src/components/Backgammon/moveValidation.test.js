import reducer, { makeMove, initialState } from './slice';
import { PLAYER } from './globals';

// Board with every point empty; callers set the specific points they need.
const emptyPoints = () =>
  Array.from({ length: 24 }, (_, i) => ({ id: i + 1, checkers: 0, player: null }));

describe('Backgammon move validation (reducer is authoritative)', () => {
  test('rejects a move onto a point held by 2+ opponent checkers', () => {
    const points = emptyPoints();
    points[11] = { id: 12, checkers: 1, player: PLAYER.LEFT }; // LEFT travel index 0
    points[6] = { id: 7, checkers: 5, player: PLAYER.RIGHT };  // 5 away, blocked

    const state = {
      ...initialState,
      points,
      player: PLAYER.LEFT,
      diceValue: [5, 3],
      selectedSpot: 12,
    };

    const next = reducer(state, makeMove({ fromPointId: 12, toPointId: 7 }));

    // Move must be rejected: board, dice, and current player are unchanged.
    expect(next.points.find((p) => p.id === 7)).toMatchObject({ checkers: 5, player: PLAYER.RIGHT });
    expect(next.points.find((p) => p.id === 12)).toMatchObject({ checkers: 1, player: PLAYER.LEFT });
    expect(next.diceValue).toEqual([5, 3]);
  });

  test('allows hitting a lone opponent blot', () => {
    const points = emptyPoints();
    points[11] = { id: 12, checkers: 1, player: PLAYER.LEFT };
    points[6] = { id: 7, checkers: 1, player: PLAYER.RIGHT }; // blot, hittable

    const state = {
      ...initialState,
      points,
      player: PLAYER.LEFT,
      diceValue: [5, 3],
      selectedSpot: 12,
    };

    const next = reducer(state, makeMove({ fromPointId: 12, toPointId: 7 }));

    expect(next.points.find((p) => p.id === 7)).toMatchObject({ checkers: 1, player: PLAYER.LEFT });
    expect(next.checkersOnBar[PLAYER.RIGHT]).toBe(1);
  });

  test('rejects bearing off while a checker remains outside the home board', () => {
    const points = emptyPoints();
    points[23] = { id: 24, checkers: 1, player: PLAYER.LEFT }; // in home, needs die 1
    points[11] = { id: 12, checkers: 1, player: PLAYER.LEFT }; // still outside home

    const state = {
      ...initialState,
      points,
      player: PLAYER.LEFT,
      diceValue: [1, 4],
      selectedSpot: 24,
    };

    const next = reducer(state, makeMove({ fromPointId: 24, toPointId: -1 }));

    expect(next.checkersBorneOff[PLAYER.LEFT]).toBe(0);
    expect(next.points.find((p) => p.id === 24)).toMatchObject({ checkers: 1, player: PLAYER.LEFT });
  });

  test('allows bearing off once every checker is in the home board', () => {
    const points = emptyPoints();
    points[23] = { id: 24, checkers: 1, player: PLAYER.LEFT };
    points[18] = { id: 19, checkers: 1, player: PLAYER.LEFT }; // also in home (19-24)

    const state = {
      ...initialState,
      points,
      player: PLAYER.LEFT,
      diceValue: [1, 4],
      selectedSpot: 24,
    };

    const next = reducer(state, makeMove({ fromPointId: 24, toPointId: -1 }));

    expect(next.checkersBorneOff[PLAYER.LEFT]).toBe(1);
  });

  test('rejects an ordinary move while the player has a checker on the bar', () => {
    const points = emptyPoints();
    points[11] = { id: 12, checkers: 1, player: PLAYER.LEFT };
    points[10] = { id: 11, checkers: 0, player: null }; // open landing one pip away

    const state = {
      ...initialState,
      points,
      player: PLAYER.LEFT,
      diceValue: [1, 4],
      checkersOnBar: { [PLAYER.LEFT]: 1, [PLAYER.RIGHT]: 0 },
      selectedSpot: 12,
    };

    const next = reducer(state, makeMove({ fromPointId: 12, toPointId: 11 }));

    // Must re-enter from the bar first; the ordinary move is rejected.
    expect(next.points.find((p) => p.id === 12)).toMatchObject({ checkers: 1, player: PLAYER.LEFT });
    expect(next.points.find((p) => p.id === 11)).toMatchObject({ checkers: 0 });
  });
});
