import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../../store';
import { PLAYERS, MESSAGES } from './globals';
import Connect4 from '.';

const renderGame = (store) => {
  // Set initial state to local mode to render game interface
  store.dispatch({ type: 'connect4/setMultiplayerMode', payload: { isMultiplayer: false, myPlayer: null } });

  return render(
    <BrowserRouter>
      <Provider store={store}>
        <Connect4 />
      </Provider>
    </BrowserRouter>
  );
};

const clickCells = async (cells, indices) => {
  for (const index of indices) {
    await act(async () => fireEvent.click(cells[index]));
  }
};

const BOARD_SIZE = 7 * 6;
const WINNING_SEQUENCE = [1, 2, 1, 2, 1, 2, 1];
const DRAW_SEQUENCE = [6, 0, 5, 1, 2, 4, 3];

describe('Connect4 Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer });
  });

  const setupGame = async () => {
    await act(async () => renderGame(store));
    const cells = screen.getAllByRole('cell');
    return cells;
  };

  describe('Initial Setup', () => {
    it('should render empty board with correct initial state', async () => {
      const cells = await setupGame();

      expect(cells).toHaveLength(BOARD_SIZE);
      cells.forEach(cell => expect(cell).toBeEmptyDOMElement());
      expect(screen.getByText('Current Player:')).toBeInTheDocument();
      expect(screen.getByText(PLAYERS.ONE)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /undo move/i })).toBeDisabled();
    });
  });

  describe('Gameplay', () => {
    it('should alternate players on each move', async () => {
      const cells = await setupGame();

      await clickCells(cells, [4]);
      expect(screen.getByLabelText(new RegExp(`Spot row 5 and col 4 with ${PLAYERS.ONE}`, 'i'))).toBeInTheDocument();
      expect(screen.getByText('Current Player:')).toBeInTheDocument();
      expect(screen.getByText(PLAYERS.TWO)).toBeInTheDocument();

      await clickCells(cells, [4]);
      expect(screen.getByLabelText(new RegExp(`Spot row 4 and col 4 with ${PLAYERS.TWO}`, 'i'))).toBeInTheDocument();
      expect(screen.getByText('Current Player:')).toBeInTheDocument();
      expect(screen.getByText(PLAYERS.ONE)).toBeInTheDocument();
    });

    it('should declare winner when four in a row achieved', async () => {
      const cells = await setupGame();

      await clickCells(cells, WINNING_SEQUENCE);
      expect(screen.getByText(/Winner:/)).toBeInTheDocument();
      expect(screen.getByText(PLAYERS.ONE)).toBeInTheDocument();
    });

    it('should declare draw when board is full', async () => {
      const cells = await setupGame();

      for (let i = 0; i < 6; i++) {
        await clickCells(cells, DRAW_SEQUENCE);
      }
      expect(screen.getByText(MESSAGES.DRAW)).toBeInTheDocument();
    });
  });

  describe('Game Controls', () => {
    it('should handle undo functionality', async () => {
      const cells = await setupGame();
      const undoButton = screen.getByRole('button', { name: /undo move/i });

      await clickCells(cells, [4]);
      expect(screen.getByLabelText(new RegExp(`Spot row 5 and col 4 with ${PLAYERS.ONE}`, 'i'))).toBeInTheDocument();
      expect(screen.getByText('Current Player:')).toBeInTheDocument();
      expect(screen.getByText(PLAYERS.TWO)).toBeInTheDocument();
      expect(undoButton).toBeDisabled();
    });
  });
});
