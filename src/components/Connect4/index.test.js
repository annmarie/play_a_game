import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../../store';
import { PLAYER, MESSAGES } from './globals';
import Connect4 from '.';

const createTestStore = (gameState = {}, multiplayerState = {}) => {
  return configureStore({ 
    reducer,
    preloadedState: {
      connect4: {
        board: Array(6).fill(null).map(() => Array(7).fill(null)),
        player: PLAYER.ONE,
        winner: null,
        winnerDesc: '',
        boardFull: false,
        history: [],
        gamesWon: { [PLAYER.ONE]: 0, [PLAYER.TWO]: 0 },
        isMultiplayer: true,
        myPlayer: PLAYER.ONE,
        isMyTurn: true,
        ...gameState
      },
      multiplayer: {
        isConnected: true,
        rooms: {
          connect4: {
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
        <Connect4 />
      </Provider>
    </BrowserRouter>
  );
};

const clickCell = async (cellIndex) => {
  const cells = screen.getAllByRole('cell');
  await act(async () => {
    fireEvent.click(cells[cellIndex]);
  });
};

describe('Connect4 Component', () => {
  describe('Multiplayer Setup', () => {
    it('should show multiplayer setup when no opponent', async () => {
      const store = createTestStore({}, {
        rooms: { connect4: { roomId: null, opponent: null } }
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
    it('should render game board with 42 cells when opponent is present', async () => {
      const store = createTestStore();
      
      await act(async () => renderGame(store));
      expect(screen.getAllByRole('cell')).toHaveLength(42);
      expect(screen.getByText('Connect Four')).toBeInTheDocument();
    });

    it('should show current player', async () => {
      const store = createTestStore();
      
      await act(async () => renderGame(store));
      expect(screen.getByText('Current Player:')).toBeInTheDocument();
      expect(screen.getByText(PLAYER.ONE)).toBeInTheDocument();
    });
  });

  describe('Game Interactions', () => {
    it('should allow moves when it is player turn', async () => {
      const store = createTestStore({ isMyTurn: true });
      
      await act(async () => renderGame(store));
      await clickCell(0); // Click first cell
      
      // Check that the move was processed (board state changed)
      const state = store.getState().connect4;
      expect(state.board[5][0]).toBe(PLAYER.ONE);
    });

    it('should prevent moves when not player turn', async () => {
      const store = createTestStore({ isMyTurn: false });
      
      await act(async () => renderGame(store));
      await clickCell(0);
      
      // Board should remain unchanged
      const state = store.getState().connect4;
      expect(state.board[5][0]).toBeNull();
    });

    it('should disable undo button in multiplayer', async () => {
      const store = createTestStore({ history: [Array(6).fill(null).map(() => Array(7).fill(null))] });
      
      await act(async () => renderGame(store));
      expect(screen.getByRole('button', { name: /undo move/i })).toBeDisabled();
    });
  });

  describe('Game States', () => {
    it('should display winner when game is won', async () => {
      const store = createTestStore({ 
        winner: PLAYER.ONE,
        winnerDesc: `${PLAYER.ONE} wins!`
      });
      
      await act(async () => renderGame(store));
      expect(screen.getByText(/Winner:/)).toBeInTheDocument();
      expect(screen.getByText(/Red wins!/)).toBeInTheDocument();
    });

    it('should display draw message when board is full', async () => {
      const store = createTestStore({ 
        boardFull: true,
        winnerDesc: MESSAGES.DRAW
      });
      
      await act(async () => renderGame(store));
      expect(screen.getByText(MESSAGES.DRAW)).toBeInTheDocument();
    });

    it('should show games won counter', async () => {
      const store = createTestStore({ 
        gamesWon: { [PLAYER.ONE]: 2, [PLAYER.TWO]: 1 }
      });
      
      await act(async () => renderGame(store));
      expect(screen.getByText('Games Won:')).toBeInTheDocument();
      expect(screen.getByText(`${PLAYER.ONE}: 2`)).toBeInTheDocument();
      expect(screen.getByText(`${PLAYER.TWO}: 1`)).toBeInTheDocument();
    });
  });
});
