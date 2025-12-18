import { render, fireEvent, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PLAYERS } from './globals';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../store';
import Backgammon from '.';
import * as gameLogic from './gameLogic';

const SPACE_KEY = ' ';

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

const INITIAL_BOARD_CONFIG = {
  0: '5 left', 18: '5 left', 6: '5 right', 12: '5 right',
  4: '3 right', 16: '3 left', 11: '2 left', 23: '2 right'
};

const DEFAULT_GAME_STATE = {
  points: Array.from({ length: 24 }, (_, i) => ({ id: i + 1, checkers: 0, player: null })),
  checkersOnBar: { left: 0, right: 0 },
  checkersBorneOff: { left: 0, right: 0 },
  diceValue: null,
  player: PLAYERS.LEFT,
  winner: null,
  selectedSpot: null,
  potentialSpots: [],
  potentialMoves: {},
  turnEnding: false,
  pointsHistory: [],
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
};

const createCustomStore = (overrides = {}) => {
  const gameState = { ...DEFAULT_GAME_STATE, ...overrides };
  return configureStore({
    reducer,
    preloadedState: { backgammon: gameState }
  });
};

const validateInitialBoard = (points) => {
  points.forEach((point, i) => {
    const label = point.getAttribute('aria-label');
    const expected = INITIAL_BOARD_CONFIG[i];
    expect(label).toContain(expected ? `${expected} checkers` : '0 checkers');
  });
};

const createBearOffTestBoard = () => {
  const config = {
    7: { checkers: 5, player: PLAYERS.RIGHT },
    8: { checkers: 5, player: PLAYERS.RIGHT },
    9: { checkers: 2, player: PLAYERS.RIGHT },
    10: { checkers: 2, player: PLAYERS.RIGHT },
    11: { checkers: 1, player: PLAYERS.RIGHT },
    19: { checkers: 5, player: PLAYERS.LEFT },
    20: { checkers: 3, player: PLAYERS.LEFT },
    21: { checkers: 2, player: PLAYERS.LEFT },
    22: { checkers: 3, player: PLAYERS.LEFT },
    23: { checkers: 1, player: PLAYERS.LEFT }
  };

  return Array.from({ length: 24 }, (_, i) => {
    const id = i + 1;
    return config[id] ? { id, ...config[id] } : { id, checkers: 0, player: null };
  });
};

describe('Backgammon Component Tests', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({ reducer });
  });

  describe('Initial Render', () => {
    it('should render the initial board with correct setup', async () => {
      await act(async () => renderGame(store));

      expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset the game/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /undo last move/i })).toBeDisabled();

      const points = screen.queryAllByRole('point');
      validateInitialBoard(points);

      expect(screen.queryAllByTestId(/die-dot-left/i)).toHaveLength(0);
      expect(screen.queryAllByTestId(/die-dot-right/i)).toHaveLength(0);
    });
  });

  describe('Point Selection and Movement', () => {
    it('should highlight selected and potential points', async () => {
      await act(async () => renderGame(store));
      await rollDice([3, 5], PLAYERS.RIGHT);

      const points = screen.queryAllByRole('point');
      await clickPoints(points, [4]);

      expect(points[4]).toHaveAttribute('data-testid', expect.stringContaining('selected'));
      expect(points[9]).toHaveAttribute('data-testid', expect.stringContaining('potential'));
      expect(points[7]).toHaveAttribute('data-testid', expect.stringContaining('potential'));
    });

    it('should complete a full move sequence', async () => {
      await act(async () => renderGame(store));
      const points = screen.queryAllByRole('point');

      await rollDice([6, 3], PLAYERS.LEFT);
      await clickPoints(points, [0, 14, 0, 17]);

      expect(points[0].getAttribute('aria-label')).toContain('3 left checkers');
      expect(points[14].getAttribute('aria-label')).toContain('1 left checkers');
      expect(points[17].getAttribute('aria-label')).toContain('1 left checkers');
      expect(screen.queryAllByTestId(/die-dot/i)).toHaveLength(0);
    });
  });

  describe('Dice Rolling', () => {
    it('should display dice dots correctly', async () => {
      await act(async () => renderGame(store));
      await rollDice([5, 3], PLAYERS.LEFT);

      expect(screen.queryAllByTestId(/die-dot-left/i)).toHaveLength(5);
      expect(screen.queryAllByTestId(/die-dot-right/i)).toHaveLength(3);
      expect(screen.queryAllByTestId(/die-dot-doubles/i)).toHaveLength(0);
    });

    it('should handle keyboard dice rolling', async () => {
      await act(async () => renderGame(store));
      gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 6], player: PLAYERS.RIGHT });

      await act(async () => fireEvent.keyDown(window, { key: SPACE_KEY }));

      expect(screen.queryAllByTestId(/die-dot-left/i)).toHaveLength(4);
      expect(screen.queryAllByTestId(/die-dot-right/i)).toHaveLength(6);
    });

    it('should prevent rolling when dice already rolled', async () => {
      await act(async () => renderGame(store));
      gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 6], player: PLAYERS.RIGHT });
      await act(async () => fireEvent.keyDown(window, { key: SPACE_KEY }));

      gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 3], player: PLAYERS.LEFT });
      await act(async () => fireEvent.keyDown(window, { key: SPACE_KEY }));

      expect(screen.queryAllByTestId(/die-dot-left/i)).toHaveLength(4);
      expect(screen.queryAllByTestId(/die-dot-right/i)).toHaveLength(6);
    });
  });

  describe('Player Interactions', () => {
    it('should handle checker bar moves for right player', async () => {
      await act(async () => renderGame(store));
      const points = screen.queryAllByRole('point');

      await rollDice([1, 6], PLAYERS.RIGHT);
      await clickPoints(points, [23, 22, 23, 17]);

      expect(points[17].getAttribute('aria-label')).toContain('1 right checkers');
    });

    it('should handle checker bar moves for left player', async () => {
      await act(async () => renderGame(store));
      const points = screen.queryAllByRole('point');

      await rollDice([6, 3], PLAYERS.LEFT);
      await clickPoints(points, [0, 14, 0, 17]);

      await rollDice([6, 1], PLAYERS.RIGHT);
      await clickPoints(points, [23, 22, 23, 17]);

      expect(points[17].getAttribute('aria-label')).toContain('1 left checkers');
    });
  });

  describe('Turn Management', () => {
    it('should show end turn button when no moves available', async () => {
      const customStore = createCustomStore({
        diceValue: [6, 5],
        pointsHistory: [DEFAULT_GAME_STATE.points]
      });

      await act(async () => renderGame(customStore));

      expect(screen.getByRole('button', { name: 'End turn' })).toBeInTheDocument();
    });

    it('should show end turn button when turn is ending', async () => {
      const customStore = createCustomStore({
        turnEnding: true,
        pointsHistory: [DEFAULT_GAME_STATE.points]
      });

      await act(async () => renderGame(customStore));

      expect(screen.getByRole('button', { name: 'End turn' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Roll Dice' })).toHaveAttribute('disabled');
    });

    it('should switch players when end turn is clicked', async () => {
      await act(async () => renderGame(store));
      const points = screen.queryAllByRole('point');

      await rollDice([6, 3], PLAYERS.LEFT);
      await clickPoints(points, [0, 14, 0, 17]);

      const endTurnButton = screen.getByRole('button', { name: /end turn/i });
      await act(async () => fireEvent.click(endTurnButton));

      expect(screen.getByLabelText(/current player/i).getAttribute('aria-label')).toContain(PLAYERS.RIGHT);
    });
  });

  describe('Bear Off Functionality', () => {
    it('should not display bear off for invalid positions', async () => {
      const customStore = createCustomStore({
        points: createBearOffTestBoard(),
        checkersBorneOff: { left: 1, right: 4 },
        diceValue: [4, 4, 4],
        player: PLAYERS.RIGHT,
        potentialMoves: { '7': [11], '8': [12], '9': [-1, -1] }
      });

      await act(async () => renderGame(customStore));

      const point11 = screen.getByTestId(/point-11/);
      await act(async () => fireEvent.click(point11));

      expect(point11).toHaveAttribute('data-testid', expect.stringContaining('selected'));
      expect(screen.queryByText(/bear off/i)).not.toBeInTheDocument();
    });

    it('should show bear off button when possible', async () => {
      const customStore = createCustomStore({
        diceValue: [6, 5],
        player: PLAYERS.RIGHT,
        potentialSpots: [-1],
        potentialMoves: { '19': [-1] }
      });

      await act(async () => renderGame(customStore));

      expect(screen.getByText('Bear Off')).toBeInTheDocument();
    });

    it('should handle undo for bear off moves', async () => {
      const customStore = createCustomStore({
        points: Array.from({ length: 24 }, (_, i) => {
          const id = i + 1;
          return id === 24 ? { id, checkers: 1, player: PLAYERS.LEFT } : { id, checkers: 0, player: null };
        }),
        checkersBorneOff: { [PLAYERS.LEFT]: 3, [PLAYERS.RIGHT]: 0 },
        diceValue: [6, 4],
        potentialSpots: [-1],
        potentialMoves: { '24': [-1] },
        pointsHistory: [Array.from({ length: 24 }, (_, i) => {
          const id = i + 1;
          return id === 24 ? { id, checkers: 2, player: PLAYERS.LEFT } : { id, checkers: 0, player: null };
        })],
        diceHistory: [[6, 4, 4]],
        playerHistory: [PLAYERS.LEFT],
        checkersOnBarHistory: [{ [PLAYERS.LEFT]: 0, [PLAYERS.RIGHT]: 0 }],
        checkersBorneOffHistory: [{ [PLAYERS.LEFT]: 2, [PLAYERS.RIGHT]: 0 }],
        potentialMovesHistory: [{ '24': [-1, -1] }]
      });

      await act(async () => renderGame(customStore));

      expect(screen.getByText('Borne Off: 3')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Undo last move' })).toHaveAttribute('disabled');
    });
  });

  describe('Game Reset and Cleanup', () => {
    it('should reset game state properly', async () => {
      await act(async () => renderGame(store));
      await rollDice([5, 3], PLAYERS.LEFT);

      await act(async () => fireEvent.click(screen.getByRole('button', { name: /reset the game/i })));

      expect(screen.getByRole('button', { name: /reset the game/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /undo last move/i })).toBeDisabled();
      expect(screen.queryAllByTestId(/die-dot/i)).toHaveLength(0);

      validateInitialBoard(screen.queryAllByRole('point'));
    });

    it('should clean up event listeners on unmount', async () => {
      const { unmount } = await act(async () => renderGame(store));
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Doubling Cube', () => {
    it('should render doubling cube with correct props', async () => {
      const customStore = createCustomStore({
        player: PLAYERS.RIGHT,
        turnEnding: true,
        doublingCube: {
          value: 2,
          owner: PLAYERS.LEFT,
          pendingOffer: null
        }
      });

      await act(async () => renderGame(customStore));

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Owned by:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /offer to double/i })).toBeInTheDocument();
    });
  });

  describe('Doubles Handling', () => {
    it('should handle doubles dice rolls correctly', async () => {
      await act(async () => renderGame(store));
      const points = screen.queryAllByRole('point');

      await rollDice([6, 3], PLAYERS.LEFT);
      await clickPoints(points, [0, 14, 0, 17]);

      await rollDice([4, 4, 4, 4], PLAYERS.RIGHT);
      await act(async () => fireEvent.click(screen.getByRole('button', { name: /reset the game/i })));

      expect(screen.getByRole('button', { name: /reset the game/i })).toBeDisabled();
      validateInitialBoard(points);
    });
  });
});
