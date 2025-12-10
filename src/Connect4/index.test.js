import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../store';
import { PLAYERS, MESSAGES } from './globals';
import Connect4 from '.';

const renderGame = (store) => render(
  <BrowserRouter>
    <Provider store={store}>
      <Connect4 />
    </Provider>
  </BrowserRouter>
);

const clickCells = async (cells, indices) => {
  for (const index of indices) {
    await act(async () => fireEvent.click(cells[index]));
  }
};

describe('Connect4 Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer });
  });

  it('should render the initial board setup', async () => {
    await act(async () => renderGame(store));
    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(42);
    cells.forEach(cell => expect(cell).toBeEmptyDOMElement());
    expect(screen.getByText(new RegExp(`Current Player: ${PLAYERS.ONE}`, 'i'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /undo move/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /reset game/i })).toBeDisabled();
  });

  it('should allow players to take turns', async () => {
    await act(async () => renderGame(store));
    const cells = screen.getAllByRole('cell');

    await clickCells(cells, [4]);
    expect(screen.getByLabelText(new RegExp(`Spot row 5 and col 4 with ${PLAYERS.ONE}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Current Player: ${PLAYERS.TWO}`, 'i'))).toBeInTheDocument();

    await clickCells(cells, [4]);
    expect(screen.getByLabelText(new RegExp(`Spot row 4 and col 4 with ${PLAYERS.TWO}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Current Player: ${PLAYERS.ONE}`, 'i'))).toBeInTheDocument();
  });

  it('should declare a winner', async () => {
    await act(async () => renderGame(store));
    const cells = screen.getAllByRole('cell');
    await clickCells(cells, [1, 2, 1, 2, 1, 2, 1]);
    expect(screen.getByText(new RegExp(`Winner: ${PLAYERS.ONE}`, 'i'))).toBeInTheDocument();
  });

  it('should declare a draw', async () => {
    await act(async () => renderGame(store));
    const cells = screen.getAllByRole('cell');
    for (let i = 0; i < 6; i++) {
      await clickCells(cells, [6, 0, 5, 1, 2, 4, 3]);
    }
    expect(screen.getByText(MESSAGES.DRAW)).toBeInTheDocument();
  });

  it('should reset the game', async () => {
    await act(async () => renderGame(store));
    const cells = screen.getAllByRole('cell');
    const resetButton = screen.getByRole('button', { name: /reset game/i });

    await clickCells(cells, [35, 35]);
    expect(resetButton).toBeEnabled();

    await act(async () => fireEvent.click(resetButton));
    expect(screen.getByText(new RegExp(`Current Player: ${PLAYERS.ONE}`, 'i'))).toBeInTheDocument();
    cells.forEach(cell => expect(cell).toBeEmptyDOMElement());
    expect(resetButton).toBeDisabled();
  });

  it('should undo last move', async () => {
    await act(async () => renderGame(store));
    const cells = screen.getAllByRole('cell');
    const undoButton = screen.getByRole('button', { name: /undo move/i });

    await clickCells(cells, [4]);
    expect(screen.getByLabelText(new RegExp(`Spot row 5 and col 4 with ${PLAYERS.ONE}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Current Player: ${PLAYERS.TWO}`, 'i'))).toBeInTheDocument();
    expect(undoButton).toBeDisabled();
  });
});