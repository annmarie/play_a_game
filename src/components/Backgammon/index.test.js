import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../../store';
import { PLAYER } from './globals';
import Backgammon from '.';
import { initializeBoard } from './boardUtils';

const createTestStore = (gameState = {}, multiplayerState = {}) => {
  return configureStore({
    reducer,
    preloadedState: {
      backgammon: {
        points: initializeBoard(),
        checkersOnBar: { [PLAYER.LEFT]: 0, [PLAYER.RIGHT]: 0 },
        checkersBorneOff: { [PLAYER.LEFT]: 0, [PLAYER.RIGHT]: 0 },
        diceValue: null,
        player: null,
        winner: null,
        selectedSpot: null,
        potentialSpots: [],
        potentialMoves: {},
        turnEnding: false,
        pointsHistory: [],
        gamesWon: { [PLAYER.LEFT]: 0, [PLAYER.RIGHT]: 0 },
        doublingCube: { value: 1, owner: null, pendingOffer: null },
        isMultiplayer: true,
        myPlayer: PLAYER.LEFT,
        isMyTurn: false,
        gameStarted: true,
        ...gameState
      },
      multiplayer: {
        isConnected: true,
        rooms: {
          backgammon: {
            roomId: 'test-room',
            opponent: 'TestPlayer'
          }
        },
        playerName: 'TestUser',
        ...multiplayerState
      }
    }
  });
};

const renderGame = (store) => {
  return render(
    <BrowserRouter>
      <Provider store={store}>
        <Backgammon />
      </Provider>
    </BrowserRouter>
  );
};

const clickPoint = async (pointIndex) => {
  const points = screen.getAllByRole('point');
  await act(async () => {
    fireEvent.click(points[pointIndex]);
  });
};

describe('Backgammon Component Tests', () => {
  describe('Multiplayer Setup', () => {
    it('should show multiplayer setup when no opponent', async () => {
      const store = createTestStore({}, {
        rooms: { backgammon: { roomId: null, opponent: null } }
      });

      await act(async () => renderGame(store));
      expect(screen.getByText('Waiting for opponent...')).toBeInTheDocument();
    });

    it('should show room status when opponent is present', async () => {
      const store = createTestStore();

      await act(async () => renderGame(store));
      expect(screen.getByText(/Room:.*test-room/)).toBeInTheDocument();
    });
  });

  describe('Game Board', () => {
    it('should render game board with 24 points when opponent is present', async () => {
      const store = createTestStore();

      await act(async () => renderGame(store));
      expect(screen.getAllByRole('point')).toHaveLength(24);
      expect(screen.getByText('Backgammon')).toBeInTheDocument();
    });

    it('should show initial board setup with checkers', async () => {
      const store = createTestStore();

      await act(async () => renderGame(store));

      // Check that initial board has checkers in starting positions
      const points = screen.getAllByRole('point');
      expect(points[0]).toHaveAttribute('aria-label', expect.stringContaining('5 left checkers'));
      expect(points[23]).toHaveAttribute('aria-label', expect.stringContaining('2 right checkers'));
    });
  });

  describe('Game Controls', () => {
    it('should show roll dice button', async () => {
      const store = createTestStore();

      await act(async () => renderGame(store));
      expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
    });

    it('should show undo button (disabled in multiplayer)', async () => {
      const store = createTestStore();

      await act(async () => renderGame(store));
      expect(screen.getByRole('button', { name: /undo last move/i })).toBeDisabled();
    });

    it('should disable dice rolling when not player turn', async () => {
      const store = createTestStore({ isMyTurn: false });

      await act(async () => renderGame(store));
      expect(screen.getByRole('button', { name: /roll dice/i })).toBeDisabled();
    });
  });

  describe('Game Interactions', () => {
    it('should allow point selection when it is player turn with dice rolled', async () => {
      const store = createTestStore({
        isMyTurn: true,
        player: PLAYER.LEFT,
        diceValue: [3, 5],
        potentialMoves: { '1': [4, 6] }
      });

      await act(async () => renderGame(store));
      await clickPoint(0); // Click first point

      const state = store.getState().backgammon;
      expect(state.selectedSpot).toBe(1);
    });

    it('should prevent moves when not player turn', async () => {
      const store = createTestStore({
        isMyTurn: false,
        player: PLAYER.RIGHT,
        diceValue: [3, 5]
      });

      await act(async () => renderGame(store));
      await clickPoint(0);

      const state = store.getState().backgammon;
      expect(state.selectedSpot).toBeNull();
    });
  });

  describe('Game States', () => {
    it('should display winner when game is won', async () => {
      const store = createTestStore({
        winner: PLAYER.LEFT,
        gamesWon: { [PLAYER.LEFT]: 1, [PLAYER.RIGHT]: 0 }
      });

      await act(async () => renderGame(store));
      expect(screen.getByText(/Winner:/)).toBeInTheDocument();
    });

    it('should show games won counter', async () => {
      const store = createTestStore({
        gamesWon: { [PLAYER.LEFT]: 2, [PLAYER.RIGHT]: 1 }
      });

      await act(async () => renderGame(store));
      expect(screen.getByText('Games Won:')).toBeInTheDocument();
      const scoreElements = screen.getAllByText('1');
      expect(scoreElements.length).toBeGreaterThan(0);
    });

    it('should show doubling cube', async () => {
      const store = createTestStore({
        doublingCube: { value: 2, owner: PLAYER.LEFT, pendingOffer: null }
      });

      await act(async () => renderGame(store));
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Owned by:')).toBeInTheDocument();
    });
  });

  describe('Turn Management', () => {
    it('should show end turn button when turn is ending', async () => {
      const store = createTestStore({
        turnEnding: true,
        pointsHistory: [initializeBoard()]
      });

      await act(async () => renderGame(store));
      expect(screen.getByRole('button', { name: /end turn/i })).toBeInTheDocument();
    });

    it('should handle start game functionality', async () => {
      const store = createTestStore({
        gameStarted: false,
        isMyTurn: true
      });

      await act(async () => renderGame(store));

      const startButton = screen.getByRole('button', { name: /start game/i });
      expect(startButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(startButton);
      });

      const state = store.getState().backgammon;
      expect(state.gameStarted).toBe(true);
    });
  });
});
