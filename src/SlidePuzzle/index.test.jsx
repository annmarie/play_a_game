import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../store';
import SlidePuzzle from '.';
import * as utils from './utils';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  setTiles: jest.fn(() => [[5,4,3],[2,1,8],[7,0,6]]),
}));

describe('SlidePuzzle Component Tests', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({ reducer });
  });

  it('should render the puzzle grid and reset button', async () => {
    await act(async () => render(<Provider store={store}><SlidePuzzle /></Provider>));
    const resetButton = screen.getByTestId('reset-button');
    expect(screen.getByRole('status')).toHaveTextContent('Game On');
    const tiles = screen.getAllByRole('cell');
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  it('should render accessible ARIA attributes', async () => {
    await act(async () => render(<Provider store={store}><SlidePuzzle /></Provider>));
    const board = screen.getByRole('grid', { name: /slide puzzle board/i });
    expect(board).toBeInTheDocument();
    const tile = screen.getAllByRole('cell', { name: /tile at row \d+ and column \d+ with (empty|\d+)/i });
    expect(tile.length).toBeGreaterThan(0);
    const resetButton = screen.getByRole('button', { name: 'Reset the game to its initial state' });
    expect(resetButton).toBeInTheDocument();
    const emptyTile = screen.getByRole('cell', { name: /tile at row \d+ and column \d+ with empty/i });
    expect(emptyTile).toHaveClass('empty');
    const numberedTile = screen.getByRole('cell', { name: /tile at row \d+ and column \d+ with 1\b/i});
    expect(numberedTile).toHaveTextContent(1);
  });

  it('should update the state when a valid tile is clicked', async () => {
    await act(async () => render(<Provider store={store}><SlidePuzzle /></Provider>));
    const tiles = screen.getAllByRole('cell');
    expect(tiles[7].getAttribute('aria-label')).toContain('empty')
    expect(tiles[6].getAttribute('aria-label')).toContain('with 7')
    await act(async () => fireEvent.click(tiles[6]))
    expect(tiles[6].getAttribute('aria-label')).toContain('empty')
    expect(tiles[7].getAttribute('aria-label')).toContain('with 7')
  });

  it('should update winner on winning move', async () => {
    await act(async () => render(<Provider store={store}><SlidePuzzle /></Provider>));
    utils.setTiles.mockReturnValueOnce([[1,2,3],[4,5,6],[7,0,8]]);
    await act(async () => fireEvent.click(screen.getByTestId('reset-button')))
    const tiles = screen.getAllByRole('cell');
    expect(tiles[7].getAttribute('aria-label')).toContain('empty')
    expect(tiles[8].getAttribute('aria-label')).toContain('with 8')
    await act(async () => fireEvent.click(tiles[8]))
    expect(tiles[8].getAttribute('aria-label')).toContain('empty')
    expect(tiles[7].getAttribute('aria-label')).toContain('with 8')
    expect(screen.getByRole('status')).toHaveTextContent('Game Won');
  });
});
