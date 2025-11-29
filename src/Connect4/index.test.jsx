import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../store';
import { PLAYER_ONE, PLAYER_TWO, DRAW_MESSAGE } from './globals';
import Connect4 from '../Connect4';

jest.mock('../TestBoardLoader', () => () => null);

const BOARD_LENGTH = 6 * 7; // 6 rows * 7 columns
const CURRENT_PLAYER_ONE = new RegExp(`Current Player: ${PLAYER_ONE}`, "i");
const CURRENT_PLAYER_TWO = new RegExp(`Current Player: ${PLAYER_TWO}`, "i");
const WINNER_PLAYER_ONE = new RegExp(`Winner: ${PLAYER_ONE}`, "i");
const RESET_GAME = /reset game/i;
const UNDO_MOVE = /undo move/i;

describe("Connect4 Component", () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer });
  });

  it("should render the initial board setup", async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Connect4 /></Provider></BrowserRouter>));
    const cells = screen.getAllByRole("cell");
    expect(cells).toHaveLength(BOARD_LENGTH);
    validateInitialBoardState(cells);
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: UNDO_MOVE })).not.toBeEnabled();
    expect(screen.getByRole('button', { name: RESET_GAME })).not.toBeEnabled();
  });

  it("should allow players to take turns", async () => {
    let spotRex;
    await act(async () => render(<BrowserRouter><Provider store={store}><Connect4 /></Provider></BrowserRouter>));
    const cells = screen.getAllByRole("cell");

    await act(async () => fireEvent.click(cells[4])); // Player One
    spotRex = new RegExp(`Spot row 5 and col 4 with ${PLAYER_ONE}`, "i");
    expect(screen.getAllByLabelText(spotRex).length).toBe(1);
    expect(screen.getByText(CURRENT_PLAYER_TWO)).toBeInTheDocument();

    await act(async () => fireEvent.click(cells[4])); // Player Two
    spotRex = new RegExp(`Spot row 4 and col 4 with ${PLAYER_TWO}`, "i");
    expect(screen.getAllByLabelText(spotRex).length).toBe(1);
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();

    await act(async () => fireEvent.click(cells[3])); // Player One
    spotRex = new RegExp(`Spot row 5 and col 3 with ${PLAYER_ONE}`, "i");
    expect(screen.getAllByLabelText(spotRex).length).toBe(1);
    expect(screen.getByText(CURRENT_PLAYER_TWO)).toBeInTheDocument();
  });

  it("should declare a winner", async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Connect4 /></Provider></BrowserRouter>));
    const cells = screen.getAllByRole("cell");
    await simulateMoves(cells, [1, 2, 1, 2, 1, 2, 1])
    expect(screen.getByText(WINNER_PLAYER_ONE)).toBeInTheDocument();
  });

  it("should declare a draw", async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Connect4 /></Provider></BrowserRouter>));
    const cells = screen.getAllByRole("cell");
    for (let i = 0; i < 6; i++) {
      await simulateMoves(cells, [6, 0, 5, 1, 2, 4, 3])
    }
    expect(screen.getByText(DRAW_MESSAGE)).toBeInTheDocument();
  });

  it("should reset the game", async () => {
    let spotRex;
    await act(async () => render(<BrowserRouter><Provider store={store}><Connect4 /></Provider></BrowserRouter>));
    const cells = screen.getAllByRole("cell");
    const resetButton = screen.getByRole('button', { name: RESET_GAME });

    await act(async () => fireEvent.click(cells[35])); // Player One
    spotRex = new RegExp(`Spot row 5 and col 0 with ${PLAYER_ONE}`, "i");
    expect(screen.getAllByLabelText(spotRex).length).toBe(1);
    expect(screen.getByText(CURRENT_PLAYER_TWO)).toBeInTheDocument();
    expect(resetButton).toBeEnabled();

    await act(async () => fireEvent.click(cells[35])); // Player Two
    spotRex = new RegExp(`Spot row 4 and col 0 with ${PLAYER_TWO}`, "i");
    expect(screen.getAllByLabelText(spotRex).length).toBe(1);
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();
    expect(resetButton).toBeEnabled();

    await act(async () => fireEvent.click(resetButton)); // Reset
    expect(screen.getByText(CURRENT_PLAYER_ONE)).toBeInTheDocument();
    validateInitialBoardState(cells);
    expect(resetButton).not.toBeEnabled();
  });

  it("should undo last move", async () => {
    let spotRex;
    await act(async () => render(<BrowserRouter><Provider store={store}><Connect4 /></Provider></BrowserRouter>));
    const cells = screen.getAllByRole("cell");
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });

    await act(async () => fireEvent.click(cells[4])); // Player One
    spotRex = new RegExp(`Spot row 5 and col 4 with ${PLAYER_ONE}`, "i");
    expect(screen.getAllByLabelText(spotRex).length).toBe(1);
    expect(screen.getByText(CURRENT_PLAYER_TWO)).toBeInTheDocument();
    expect(undoButton).toHaveAttribute('disabled');
  });
});

const validateInitialBoardState = (cells) => {
  cells.forEach((cell) => {
    expect(cell).toBeEmptyDOMElement();
  });
};

const simulateMoves = async (cells, moves) => {
  await act(async () => {
    moves.forEach((index) => fireEvent.click(cells[index]));
  });
};
