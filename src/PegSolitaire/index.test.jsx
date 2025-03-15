import { render, screen, fireEvent, act } from '@testing-library/react';
import PegSolitaire from '../PegSolitaire';
import { initialState } from './slice';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../store';

const BOARD_LENGTH = 7 * 7; // 7 rows * 7 columns
const UNDO_BUTTON = /Undo the last move/i
const RESET_BUTTON = /Reset the game to its initial state/i
const GAME_STATUS = /Game Status/i
const SELECT_CELL = /Cell at row \d+, column \d+ is (a peg|empty|not playable)/i

describe('PegSolitaire Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer });
  });

  it('should render the peg solitaire board', async () => {
    await act(async () => render(<Provider store={store}><PegSolitaire /></Provider>));
    const undoButton = screen.getByRole('button', { name: UNDO_BUTTON });
    const resetButton = screen.getByRole('button', { name: RESET_BUTTON });
    const gameStatus = screen.getByRole('status', { name: GAME_STATUS });
    const cells = screen.getAllByRole('button', { name: SELECT_CELL });
    const { board } = initialState;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = board[row][col];
        const altText = `Cell at row ${row + 1}, column ${col + 1} is ` +
          `${cell === 1 ? 'a peg' : cell === 0 ? 'empty' : 'not playable'}`
        expect(screen.getByLabelText(altText)).toBeInTheDocument();
      }
    }
    expect(gameStatus).toBeInTheDocument();
    expect(undoButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
    expect(cells.length).toEqual(BOARD_LENGTH);
  });

  it('should handle a first move', async () => {
    await act(async () => render(<Provider store={store}><PegSolitaire /></Provider>));
    const undoButton = screen.getByRole('button', { name: UNDO_BUTTON });
    const resetButton = screen.getByRole('button', { name: RESET_BUTTON });
    const { board } = initialState;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = board[row][col];
        const altText = `Cell at row ${row + 1}, column ${col + 1} is ` +
        `${cell === 1 ? 'a peg' : cell === 0 ? 'empty' : 'not playable'}`
        expect(screen.getByLabelText(altText)).toBeInTheDocument();
      }
    }
    const pegCell1 = screen.getByLabelText(/Cell at row 4, column 2 is a peg/i);
    await act(async () => fireEvent.click(pegCell1));
    expect(screen.getByLabelText(/Cell at row 4, column 2 is a peg and selected/i)).toBeInTheDocument();
    const pegCell2 = screen.getByLabelText(/Cell at row 4, column 4 is empty/i);
    await act(async () => fireEvent.click(pegCell2));
    expect(screen.getByLabelText(/Cell at row 4, column 2 is empty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cell at row 4, column 3 is empty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cell at row 4, column 4 is a peg/i)).toBeInTheDocument();
    expect(undoButton).not.toBeDisabled();
    expect(resetButton).not.toBeDisabled();
  });

  it('should handle undo button click', async () => {
    await act(async () => render(<Provider store={store}><PegSolitaire /></Provider>));
    const undoButton = screen.getByRole('button', { name: UNDO_BUTTON });
    expect(undoButton).toBeDisabled();
    await act(async () => fireEvent.click(screen.getByLabelText(/Cell at row 4, column 2 is a peg/i)));
    expect(screen.getByLabelText(/Cell at row 4, column 2 is a peg and selected/i)).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByLabelText(/Cell at row 4, column 4 is empty/i)));
    expect(screen.getByLabelText(/Cell at row 4, column 2 is empty/i)).toBeInTheDocument();
    expect(undoButton).not.toBeDisabled();
    await act(async () => fireEvent.click(undoButton));
    expect(screen.getByLabelText(/Cell at row 4, column 2 is a peg/i)).toBeInTheDocument();
  });

  it('should handle a win and reset it', async () => {
    await act(async () => render(<Provider store={store}><PegSolitaire /></Provider>));
    const cells = screen.getAllByRole('button', { name: SELECT_CELL });
    const winCellClickOrder = [
      22, 24, 37, 23, 28, 30, 14, 28, 31, 29, 28, 30, 23, 37, 33, 31,
      46, 32, 31, 33, 44, 46, 37, 39, 46, 32, 33, 31, 18, 32, 31, 33,
      34, 32, 27, 25, 32, 18, 11, 25, 20, 18, 25, 11, 4, 18, 17, 19,
      2, 4, 9, 11, 4, 18, 19, 17, 24, 10, 15, 17, 10, 24
    ]
    for (const c of winCellClickOrder) {
      await act(async () => fireEvent.click(cells[c]));
    }
    expect(screen.getByText('Game Won')).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: RESET_BUTTON })));
    const { board } = initialState;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = board[row][col];
        const altText = `Cell at row ${row + 1}, column ${col + 1} is ` +
          `${cell === 1 ? 'a peg' : cell === 0 ? 'empty' : 'not playable'}`
        expect(screen.getByLabelText(altText)).toBeInTheDocument();
      }
    }
  });
});
