import { render, fireEvent, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PLAYERS } from './globals';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../store';
import Backgammon from '.';
import * as gameLogic from './gameLogic';

jest.mock('./gameLogic', () => ({
  ...jest.requireActual('./gameLogic'),
  rollDiceLogic: jest.fn(),
}));

const renderGame = (store) => render(
  <BrowserRouter>
    <Provider store={store}>
      <Backgammon />
    </Provider>
  </BrowserRouter>
);

const rollDice = async (diceValue, player) => {
  gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue, player });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /roll dice/i })));
};

const clickPoints = async (points, indices) => {
  for (const index of indices) {
    await act(async () => fireEvent.click(points[index]));
  }
};

const validateInitialBoard = (points) => {
  const expected = {
    0: '5 left', 18: '5 left', 6: '5 right', 12: '5 right',
    4: '3 right', 16: '3 left', 11: '2 left', 23: '2 right'
  };
  points.forEach((point, i) => {
    const label = point.getAttribute('aria-label');
    expect(label).toContain(expected[i] ? `${expected[i]} checkers` : '0 checkers');
  });
};

describe('Backgammon Component Tests', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({ reducer });
  });

  it('should render the initial board', async () => {
    await act(async () => renderGame(store));
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset the game/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /undo last move/i })).toBeDisabled();
    const points = screen.queryAllByRole('point');
    validateInitialBoard(points);
    expect(screen.queryAllByTestId(/die-dot-left/i)).toHaveLength(0);
    expect(screen.queryAllByTestId(/die-dot-right/i)).toHaveLength(0);
  });

  it('should have class selected on the point if selected for play', async () => {
    await act(async () => renderGame(store));
    await rollDice([3, 5], PLAYERS.RIGHT);
    const points = screen.queryAllByRole('point');
    await clickPoints(points, [4]);
    expect(points[4]).toHaveAttribute('data-testid', expect.stringContaining('selected'));
    expect(points[9]).toHaveAttribute('data-testid', expect.stringContaining('potential'));
    expect(points[7]).toHaveAttribute('data-testid', expect.stringContaining('potential'));
  });

  it('should roll the dice and render the dots for each die', async () => {
    await act(async () => renderGame(store));
    await rollDice([5, 3], PLAYERS.LEFT);
    expect(screen.queryAllByTestId(/die-dot-left/i)).toHaveLength(5);
    expect(screen.queryAllByTestId(/die-dot-right/i)).toHaveLength(3);
    expect(screen.queryAllByTestId(/die-dot-doubles/i)).toHaveLength(0);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /reset the game/i })));
    expect(screen.getByRole('button', { name: /reset the game/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /undo last move/i })).toBeDisabled();
    expect(screen.queryAllByTestId(/die-dot/i)).toHaveLength(0);
    validateInitialBoard(screen.queryAllByRole('point'));
  });

  it('should be able roll dice, make a move and reset board', async () => {
    await act(async () => renderGame(store));
    const points = screen.queryAllByRole('point');
    await rollDice([6, 3], PLAYERS.LEFT);
    await clickPoints(points, [0, 14, 0, 17]);

    expect(points[0].getAttribute('aria-label')).toContain('3 left checkers');
    expect(points[14].getAttribute('aria-label')).toContain('1 left checkers');
    expect(points[17].getAttribute('aria-label')).toContain('1 left checkers');
    expect(screen.queryAllByTestId(/die-dot/i)).toHaveLength(0);

    const endTurnButton = screen.getByRole('button', { name: /end turn/i });
    await act(async () => fireEvent.click(endTurnButton));
    expect(screen.getByLabelText(/current player/i).getAttribute('aria-label')).toContain('right');

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /reset the game/i })));
    expect(screen.getByRole('button', { name: /reset the game/i })).toBeDisabled();
    validateInitialBoard(points);
  });

  it('should move a right player to the checker bar', async () => {
    await act(async () => renderGame(store));
    const points = screen.queryAllByRole('point');
    await rollDice([1, 6], PLAYERS.RIGHT);
    await clickPoints(points, [23, 22, 23, 17]);
    expect(points[17].getAttribute('aria-label')).toContain('1 right checkers');

    await rollDice([6, 3], PLAYERS.LEFT);
    await clickPoints(points, [0, 14, 0, 17]);
    expect(points[17].getAttribute('aria-label')).toContain('1 right checkers');
  });

  it('should move a left player to the checker bar', async () => {
    await act(async () => renderGame(store));
    const points = screen.queryAllByRole('point');
    await rollDice([6, 3], PLAYERS.LEFT);
    await clickPoints(points, [0, 14, 0, 17]);
    expect(points[17].getAttribute('aria-label')).toContain('1 left checkers');

    await rollDice([6, 1], PLAYERS.RIGHT);
    await clickPoints(points, [23, 22, 23, 17]);
    expect(points[17].getAttribute('aria-label')).toContain('1 left checkers');
  });

  it('should display four sets of die when doubles are rolled', async () => {
    await act(async () => renderGame(store));
    const points = screen.queryAllByRole('point');
    await rollDice([6, 3], PLAYERS.LEFT);
    await clickPoints(points, [0, 14, 0, 17]);

    await rollDice([4, 4, 4, 4], PLAYERS.RIGHT);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /reset the game/i })));
    expect(screen.getByRole('button', { name: /reset the game/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /undo last move/i })).toBeDisabled();
    validateInitialBoard(points);
  });

  it('should roll the dice when spacebar is pressed and diceValue is null', async () => {
    await act(async () => renderGame(store));
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 6], player: PLAYERS.RIGHT });
    await act(async () => fireEvent.keyDown(window, { key: ' ' }));
    expect(screen.queryAllByTestId(/die-dot-left/i)).toHaveLength(4);
    expect(screen.queryAllByTestId(/die-dot-right/i)).toHaveLength(6);
  });

  it('should not roll the dice when spacebar is pressed and diceValue is not null', async () => {
    await act(async () => renderGame(store));
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 6], player: PLAYERS.RIGHT });
    await act(async () => fireEvent.keyDown(window, { key: ' ' }));
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 3], player: PLAYERS.LEFT });
    await act(async () => fireEvent.keyDown(window, { key: ' ' }));
    expect(screen.queryAllByTestId(/die-dot-left/i)).toHaveLength(4);
    expect(screen.queryAllByTestId(/die-dot-right/i)).toHaveLength(6);
  });

  it('should clean up the event listener on unmount', async () => {
    const { unmount } = await act(async () => renderGame(store));
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should show end turn button when no moves available', async () => {
    const customStore = configureStore({
      reducer,
      preloadedState: {
        backgammon: {
          points: Array.from({ length: 24 }, (_, i) => ({ id: i + 1, checkers: 0, player: null })),
          checkersOnBar: { left: 0, right: 0 },
          checkersBorneOff: { left: 0, right: 0 },
          diceValue: [6, 5],
          player: PLAYERS.LEFT,
          winner: null,
          selectedSpot: null,
          potentialSpots: [],
          potentialMoves: {},
          turnEnding: false,
          pointsHistory: [Array.from({ length: 24 }, (_, i) => ({ id: i + 1, checkers: 0, player: null }))],
          diceHistory: [],
          playerHistory: [],
          checkersOnBarHistory: [],
          checkersBorneOffHistory: [],
          potentialMovesHistory: [],
          gamesWon: { left: 0, right: 0 },
          doublingCube: {
            value: 1,
            owner: null,
            pendingOffer: null
          }
        }
      }
    });

    await act(async () => renderGame(customStore));
    const endTurnButton = screen.getByRole('button', { name: END_TURN });
    expect(endTurnButton).toBeInTheDocument();
  });

  it('should show end turn button when turn is ending', async () => {
    const customStore = configureStore({
      reducer,
      preloadedState: {
        backgammon: {
          points: Array.from({ length: 24 }, (_, i) => ({ id: i + 1, checkers: 0, player: null })),
          checkersOnBar: { left: 0, right: 0 },
          checkersBorneOff: { left: 0, right: 0 },
          diceValue: null,
          player: PLAYERS.LEFT,
          winner: null,
          selectedSpot: null,
          potentialSpots: [],
          potentialMoves: {},
          turnEnding: true,
          pointsHistory: [Array.from({ length: 24 }, (_, i) => ({ id: i + 1, checkers: 0, player: null }))],
          diceHistory: [],
          playerHistory: [],
          checkersOnBarHistory: [],
          checkersBorneOffHistory: [],
          potentialMovesHistory: [],
          gamesWon: { left: 0, right: 0 },
          doublingCube: {
            value: 1,
            owner: null,
            pendingOffer: null
          }
        }
      }
    });

    await act(async () => renderGame(customStore));
    const endTurnButton = screen.getByRole('button', { name: END_TURN });
    expect(endTurnButton).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ROLL_DICE })).toHaveAttribute('disabled');
  });

  it('should end turn when end turn button is clicked', async () => {
    await act(async () => renderGame(store));
    const points = screen.queryAllByRole('point');
    await rollDice([6, 3], PLAYERS.LEFT);
    await clickPoints(points, [0, 14, 0, 17]);

    const endTurnButton = screen.getByRole('button', { name: /end turn/i });
    await act(async () => fireEvent.click(endTurnButton));
    expect(screen.getByLabelText(/current player/i).getAttribute('aria-label')).toContain(PLAYERS.RIGHT);
  });

  it('should not display bear off when clicking on point 11 with specific board', async () => {
    const customPoints = Array.from({ length: 24 }, (_, i) => {
      const id = i + 1;
      if (id === 7 || id === 8) return { id, checkers: 5, player: PLAYERS.RIGHT };
      if (id === 9 || id === 10) return { id, checkers: 2, player: PLAYERS.RIGHT };
      if (id === 11) return { id, checkers: 1, player: PLAYERS.RIGHT };
      if (id === 19) return { id, checkers: 5, player: PLAYERS.LEFT };
      if (id === 20) return { id, checkers: 3, player: PLAYERS.LEFT };
      if (id === 21) return { id, checkers: 2, player: PLAYERS.LEFT };
      if (id === 22) return { id, checkers: 3, player: PLAYERS.LEFT };
      if (id === 23) return { id, checkers: 1, player: PLAYERS.LEFT };
      return { id, checkers: 0, player: null };
    });

    const customStore = configureStore({
      reducer,
      preloadedState: {
        backgammon: {
          points: customPoints,
          checkersOnBar: { left: 0, right: 0 },
          checkersBorneOff: { left: 1, right: 4 },
          diceValue: [4, 4, 4],
          player: PLAYERS.RIGHT,
          winner: null,
          selectedSpot: null,
          potentialSpots: [],
          potentialMoves: { '7': [11], '8': [12], '9': [-1, -1] },
          turnEnding: false,
          pointsHistory: [],
          diceHistory: [],
          playerHistory: [],
          checkersOnBarHistory: [],
          potentialMovesHistory: [],
          gamesWon: { left: 0, right: 0 },
          doublingCube: {
            value: 1,
            owner: null,
            pendingOffer: null
          }
        }
      }
    });

    await act(async () => renderGame(customStore));
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.RIGHT);
    const point11 = screen.getByTestId(/point-11/);
    expect(point11).toBeInTheDocument();
    expect(point11.getAttribute('aria-label')).toContain('Point 11 with 1 right checkers');
    await act(async () => fireEvent.click(point11));
    expect(point11).toHaveAttribute('data-testid', expect.stringContaining('selected'));
    const bearOffButton = screen.queryByText(/bear off/i);
    expect(bearOffButton).not.toBeInTheDocument();
  });

  it('should show bear off button when bearing off is possible', async () => {
    const customStore = configureStore({
      reducer,
      preloadedState: {
        backgammon: {
          points: Array.from({ length: 24 }, (_, i) => ({ id: i + 1, checkers: 0, player: null })),
          checkersOnBar: { left: 0, right: 0 },
          checkersBorneOff: { left: 0, right: 0 },
          diceValue: [6, 5],
          player: PLAYERS.RIGHT,
          winner: null,
          selectedSpot: null,
          potentialSpots: [-1],
          potentialMoves: { '19': [-1] },
          turnEnding: false,
          pointsHistory: [],
          diceHistory: [],
          playerHistory: [],
          checkersOnBarHistory: [],
          potentialMovesHistory: [],
          gamesWon: { left: 0, right: 0 },
          doublingCube: {
            value: 1,
            owner: null,
            pendingOffer: null
          }
        }
      }
    });

    await act(async () => renderGame(customStore));
    const bearOffButton = screen.getByText('Bear Off');
    expect(bearOffButton).toBeInTheDocument();
  });

  it('should reset checkersBorneOff when undoing a bear off move', async () => {
    const customStore = configureStore({
      reducer,
      preloadedState: {
        backgammon: {
          points: Array.from({ length: 24 }, (_, i) => {
            const id = i + 1;
            if (id === 24) return { id, checkers: 1, player: PLAYERS.LEFT };
            return { id, checkers: 0, player: null };
          }),
          checkersOnBar: { left: 0, right: 0 },
          checkersBorneOff: { left: 3, right: 0 },
          diceValue: [6, 4],
          player: PLAYERS.LEFT,
          winner: null,
          selectedSpot: null,
          potentialSpots: [-1],
          potentialMoves: { '24': [-1] },
          turnEnding: false,
          pointsHistory: [Array.from({ length: 24 }, (_, i) => {
            const id = i + 1;
            if (id === 24) return { id, checkers: 2, player: PLAYERS.LEFT };
            return { id, checkers: 0, player: null };
          })],
          diceHistory: [[6, 4, 4]],
          playerHistory: [PLAYERS.LEFT],
          checkersOnBarHistory: [{ left: 0, right: 0 }],
          checkersBorneOffHistory: [{ left: 2, right: 0 }],
          potentialMovesHistory: [{ '24': [-1, -1] }],
          gamesWon: { left: 0, right: 0 },
          doublingCube: {
            value: 1,
            owner: null,
            pendingOffer: null
          }
        }
      }
    });

    await act(async () => renderGame(customStore));
    expect(screen.getByText('Borne Off: 3')).toBeInTheDocument();
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    expect(undoButton).toHaveAttribute('disabled');
  });

  it('should render DoublesCube with correct props', async () => {
    const customStore = configureStore({
      reducer,
      preloadedState: {
        backgammon: {
          points: Array.from({ length: 24 }, (_, i) => ({ id: i + 1, checkers: 0, player: null })),
          checkersOnBar: { left: 0, right: 0 },
          checkersBorneOff: { left: 0, right: 0 },
          diceValue: null,
          player: PLAYERS.RIGHT,
          winner: null,
          selectedSpot: null,
          potentialSpots: [],
          potentialMoves: {},
          turnEnding: true,
          pointsHistory: [],
          diceHistory: [],
          playerHistory: [],
          checkersOnBarHistory: [],
          checkersBorneOffHistory: [],
          potentialMovesHistory: [],
          gamesWon: { left: 0, right: 0 },
          doublingCube: {
            value: 2,
            owner: PLAYERS.LEFT,
            pendingOffer: null
          }
        }
      }
    });

    await act(async () => renderGame(customStore));
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Owned by:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /offer to double/i })).toBeInTheDocument();
  });
});
