import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { PLAYER_ONE, PLAYER_TWO, DRAW_MESSAGE } from './globals';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../store';
import TicTacToe from '.';

const BOARD_LENGTH = 3 * 3; // 3 rows * 3 columns
const CURRENT_PLAYER_ONE = new RegExp(`Player: ${PLAYER_ONE}`, 'i');
const CURRENT_PLAYER_TWO = new RegExp(`Player: ${PLAYER_TWO}`, 'i');
const WINNER_PLAYER_ONE = new RegExp(`Winner: ${PLAYER_ONE}`, 'i')
const RESET_GAME = /reset game/i;
const UNDO_MOVE = /undo move/i;

describe('TicTacToe Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer });
  });

  const validateInitialBoardState = (cells) => {
    cells.forEach((cell) => { expect(cell).toBeEmptyDOMElement(); });
  }

  const simulateMoves = async (cells, moves) => {
    await act(async () => {
      moves.forEach((index) => fireEvent.click(cells[index]));
    });
  };

  const simulatePlayerOneWin = async (cells) => {
    await simulateMoves(cells, [0, 3, 1, 4, 2])
  }

  const setUpBoardWithNoWinners = async (cells) => {
    await simulateMoves(cells, [0, 1, 2, 4, 3, 5, 7, 6, 8])
  }

  it('should render the initial board', async () => {
    await act(async () => render(<Provider store={store}><TicTacToe /></Provider>))
    const cells = screen.getAllByRole('cell');
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    const resetButton = screen.getByRole('button', { name: RESET_GAME });
    expect(cells).toHaveLength(BOARD_LENGTH);
    validateInitialBoardState(cells)
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();
    expect(undoButton).not.toBeEnabled();
    expect(resetButton).not.toBeEnabled();
  });

  it('should allow players to take turns', async () => {
    await act(async () => render(<Provider store={store}><TicTacToe /></Provider>))
    const cells = [...screen.getAllByRole('cell')];
    expect(cells[0]).toHaveAttribute('aria-label', `Cell 0: empty`);
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();
    await act(async () => fireEvent.click(cells[0])); // Player One
    expect(cells[0]).toHaveAttribute('aria-label', `Cell 0: ${PLAYER_ONE}`);
    expect(screen.getByText(CURRENT_PLAYER_TWO)).toBeInTheDocument();
    await act(async () => fireEvent.click(cells[1])); // Player Two
    expect(cells[1]).toHaveAttribute('aria-label', `Cell 1: ${PLAYER_TWO}`);
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();
    await act(async () => fireEvent.click(cells[2])); // Player One
    expect(cells[2]).toHaveAttribute('aria-label', `Cell 2: ${PLAYER_ONE}`);
    expect(screen.getByText(CURRENT_PLAYER_TWO)).toBeInTheDocument();
    await act(async () => fireEvent.click(cells[3])); // Player Two
    expect(cells[3]).toHaveAttribute('aria-label', `Cell 3: ${PLAYER_TWO}`);
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();
  });

  it('should declare a winner', async () => {
    await act(async () => render(<Provider store={store}><TicTacToe /></Provider>))
    const cells = screen.getAllByRole('cell');
    await simulatePlayerOneWin(cells);
    expect(screen.getByText(WINNER_PLAYER_ONE)).toBeInTheDocument();
  });

  it('should declare a draw', async () => {
    await act(async () => render(<Provider store={store}><TicTacToe /></Provider>))
    const cells = screen.getAllByRole('cell');
    await setUpBoardWithNoWinners(cells)
    expect(screen.getByText(DRAW_MESSAGE)).toBeInTheDocument();
  });

  it('should reset the game', async () => {
    await act(async () => render(<Provider store={store}><TicTacToe /></Provider>))
    const cells = screen.getAllByRole('cell');
    const resetButton = screen.getByRole('button', { name: RESET_GAME });
    expect(cells[0]).toHaveAttribute('aria-label', `Cell 0: empty`);
    await act(async () => fireEvent.click(cells[0])); // Player 1);
    expect(cells[0]).toHaveAttribute('aria-label', `Cell 0: ${PLAYER_ONE}`);
    expect(resetButton).toBeEnabled();
    await act(async () => fireEvent.click(cells[1])); // Player 2
    expect(cells[1]).toHaveAttribute('aria-label', `Cell 1: ${PLAYER_TWO}`);
    expect(resetButton).toBeEnabled();
    await act(async () => fireEvent.click(resetButton)) // Reset
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();
    //expect(resetButton).not.toBeEnabled();
    //validateInitialBoardState(cells)
  });

  it('should undo last move', async () => {
    await act(async () => render(<Provider store={store}><TicTacToe /></Provider>))
    const cells = screen.getAllByRole('cell');
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    await act(async () => fireEvent.click(cells[0])); // Player One
    expect(cells[0]).toHaveAttribute('aria-label', `Cell 0: ${PLAYER_ONE}`);
    expect(screen.getByText(CURRENT_PLAYER_TWO)).toBeInTheDocument();
    expect(undoButton).toBeEnabled();
    await act(async () => fireEvent.click(undoButton)); // Undo
    expect(cells[0]).toHaveAttribute('aria-label', `Cell 0: empty`);
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();
    expect(undoButton).not.toBeEnabled();
  });

  it('should not allow undo after a winning move', async () => {
    await act(async () => render(<Provider store={store}><TicTacToe /></Provider>))
    const cells = screen.getAllByRole('cell');
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    await simulatePlayerOneWin(cells)
    expect(screen.getByText(WINNER_PLAYER_ONE)).toBeInTheDocument();
    await act(async () => fireEvent.click(undoButton)); // Undo
    expect(screen.getByText(WINNER_PLAYER_ONE)).toBeInTheDocument();
    expect(undoButton).not.toBeEnabled();
  });

  it('should not make move if cell is already occupied', async () => {
    await act(async () => render(<Provider store={store}><TicTacToe /></Provider>))
    const cells = screen.getAllByRole('cell');
    await act(async () => fireEvent.click(cells[0])); // Player One
    expect(cells[0]).toHaveAttribute('aria-label', `Cell 0: ${PLAYER_ONE}`);
    expect(screen.getByText(CURRENT_PLAYER_TWO)).toBeInTheDocument();
    await act(async () => fireEvent.click(cells[0])); // Player Two same move
    expect(cells[0]).toHaveAttribute('aria-label', `Cell 0: ${PLAYER_ONE}`);
    expect(screen.getByText(CURRENT_PLAYER_TWO)).toBeInTheDocument();
  });

  it('should not make move after a winning move', async () => {
    await act(async () => render(<Provider store={store}><TicTacToe /></Provider>))
    const cells = screen.getAllByRole('cell');
    await simulatePlayerOneWin(cells)
    expect(screen.getByText(WINNER_PLAYER_ONE)).toBeInTheDocument();
    await act(async () => fireEvent.click(cells[5]));
    expect(cells[5]).toHaveAttribute('aria-label', `Cell 5: empty`);
    expect(screen.getByText(WINNER_PLAYER_ONE)).toBeInTheDocument();
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    expect(undoButton).not.toBeEnabled();
  });

  afterEach(() => {
    cleanup();
  });
});
