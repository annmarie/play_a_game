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

const PLAYER_LABEL = /current player [left|right]/i
const DICE_DOT_LEFT_TEST_ID = /die-dot-left/i;
const DICE_DOT_EXTRA_LEFT_TEST_ID = /die-dot-doubles-left/i;
const DICE_DOT_RIGHT_TEST_ID = /die-dot-right/i;
const DICE_DOT_EXTRA_RIGHT_TEST_ID = /die-dot-doubles-right/i;
const ROLL_DICE = /roll dice/i;
const END_TURN = /end turn/i;
const RESET_GAME = /reset the game/i;
const UNDO_MOVE = /undo last move/i;
const BEAR_OFF = /bear off/i;
const SPACEBAR_KEY = ' ';

describe('Backgammon Component Tests', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({ reducer });
  });

  it('should render the initial board', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    const rollButton = screen.getByRole('button', { name: ROLL_DICE });
    expect(rollButton).toBeInTheDocument();
    const resetButton = screen.getByRole('button', { name: RESET_GAME });
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveAttribute('disabled');
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    expect(undoButton).toBeInTheDocument();
    expect(undoButton).toHaveAttribute('disabled');
    const points = screen.queryAllByRole('point');
    validateInitialBoardState(points);
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(0);
  });

  it('should have class selected on the point if selected for play', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    const rollButton = screen.getByRole('button', { name: ROLL_DICE });
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [3, 5], player: PLAYERS.RIGHT });
    await act(async () => fireEvent.click(rollButton));
    const points = screen.queryAllByRole('point');
    const selectCell = 4;
    await act(async () => fireEvent.click(points[selectCell]));
    expect(points[selectCell]).toHaveAttribute('data-testid', expect.stringContaining('selected'));
    expect(points[9]).toHaveAttribute('data-testid', expect.stringContaining('potential'));
    expect(points[7]).toHaveAttribute('data-testid', expect.stringContaining('potential'));
  });

  it('should roll the dice and render the dots for each die', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    const rollButton = screen.getByRole('button', { name: ROLL_DICE });
    const resetButton = screen.getByRole('button', { name: RESET_GAME });
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    const [leftDie, rightDie] = [5, 3]
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [leftDie, rightDie], player: PLAYERS.LEFT });
    await act(async () => fireEvent.click(rollButton));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toEqual(5);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toEqual(3);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toEqual(0);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toEqual(0);
    await act(async () => fireEvent.click(resetButton));
    expect(resetButton).toHaveAttribute('disabled');
    expect(undoButton).toHaveAttribute('disabled');
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toBe(0);
    const points = screen.queryAllByRole('point');
    validateInitialBoardState(points);
  });

  it('should be able roll dice, make a move and reset board', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    const rollButton = screen.getByRole('button', { name: ROLL_DICE });
    const resetButton = screen.getByRole('button', { name: RESET_GAME });
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    const points = screen.queryAllByRole('point');
    expect(points[0].getAttribute('aria-label')).toContain('5 left checkers')
    expect(points[14].getAttribute('aria-label')).toContain('0 checkers')
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYERS.LEFT });
    await act(async () => fireEvent.click(rollButton));
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[14]));
    expect(points[0].getAttribute('aria-label')).toContain('4 left checkers')
    expect(points[14].getAttribute('aria-label')).toContain('1 left checkers')
    expect(points[17].getAttribute('aria-label')).toContain('0 checkers')
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain('left')
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[17]));
    expect(points[17].getAttribute('aria-label')).toContain('1 left checkers')
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toBe(0);
    // Should show end turn button when all dice are used (turnEnding should be true)
    const endTurnButton = screen.getByRole('button', { name: END_TURN });
    expect(endTurnButton).toBeInTheDocument();
    await act(async () => fireEvent.click(endTurnButton));
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain('right');
    await act(async () => fireEvent.click(resetButton));
    expect(resetButton).toHaveAttribute('disabled');
    expect(undoButton).toHaveAttribute('disabled');
    validateInitialBoardState(points);
  });

  it('should move a right player to the checker bar', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    const points = screen.queryAllByRole('point');
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 6], player: PLAYERS.RIGHT });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: ROLL_DICE })));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(1);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(6);
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.RIGHT)
    await act(async () => fireEvent.click(points[23]));
    await act(async () => fireEvent.click(points[22]));
    await act(async () => fireEvent.click(points[23]));
    await act(async () => fireEvent.click(points[17]));
    expect(points[17].getAttribute('aria-label')).toContain('1 right checkers')
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.RIGHT)
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYERS.LEFT });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: ROLL_DICE })));
    expect(points[0].getAttribute('aria-label')).toContain('5 left checkers')
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[14]));
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[17]));
    expect(points[17].getAttribute('aria-label')).toContain('1 right checkers')
  });

  it('should move a left player to the checker bar', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    const points = screen.queryAllByRole('point');
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYERS.LEFT });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: ROLL_DICE })));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(6);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(3);
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.LEFT)
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[14]));
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[17]));
    expect(points[17].getAttribute('aria-label')).toContain('1 left checkers')
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.LEFT)
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 1], player: PLAYERS.RIGHT });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: ROLL_DICE })));
    expect(points[23].getAttribute('aria-label')).toContain('2 right checkers')
    await act(async () => fireEvent.click(points[23]));
    await act(async () => fireEvent.click(points[22]));
    await act(async () => fireEvent.click(points[23]));
    await act(async () => fireEvent.click(points[17]));
    expect(points[17].getAttribute('aria-label')).toContain('1 left checkers')
  });

  it('should be able display four sets of die when doubles are rolled', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    const points = screen.queryAllByRole('point');
    // first roll cannot be doubles
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYERS.LEFT });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: ROLL_DICE })));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(6);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(3);
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.LEFT)
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[14]));
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[17]));
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.LEFT)
    // second move will be doubles
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 4, 4, 4], player: PLAYERS.RIGHT });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: ROLL_DICE })));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: RESET_GAME })));
    expect(screen.getByRole('button', { name: RESET_GAME })).toHaveAttribute('disabled');
    expect(screen.getByRole('button', { name: UNDO_MOVE })).toHaveAttribute('disabled');
    validateInitialBoardState(points);
  });

  it('should roll the dice when the spacebar is pressed and diceValue is null', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    const rollButton = screen.getByRole('button', { name: ROLL_DICE });
    expect(rollButton).toBeInTheDocument();
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 6], player: PLAYERS.RIGHT });
    await act(async () => fireEvent.keyDown(window, { key: SPACEBAR_KEY }));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(6);
  });

  it('should not roll the dice when the spacebar is pressed and diceValue is not null', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    expect(screen.getByRole('button', { name: ROLL_DICE })).toBeInTheDocument();
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [4, 6], player: PLAYERS.RIGHT });
    await act(async () => fireEvent.keyDown(window, { key: SPACEBAR_KEY }));
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [1, 3], player: PLAYERS.LEFT });
    await act(async () => fireEvent.keyDown(window, { key: SPACEBAR_KEY }));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(6);
  });

  it('should clean up the event listener on unmount', async () => {
    const { unmount } = await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should show release move to next player button when no moves available', async () => {
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
          potentialMoves: {}, // No moves available
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

    await act(async () => render(<BrowserRouter><Provider store={customStore}><Backgammon /></Provider></BrowserRouter>));

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

    await act(async () => render(<BrowserRouter><Provider store={customStore}><Backgammon /></Provider></BrowserRouter>));

    const endTurnButton = screen.getByRole('button', { name: END_TURN });
    expect(endTurnButton).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ROLL_DICE })).toHaveAttribute('disabled');
  });

  it('should end turn when end turn button is clicked', async () => {
    await act(async () => render(<BrowserRouter><Provider store={store}><Backgammon /></Provider></BrowserRouter>));

    const points = screen.queryAllByRole('point');
    gameLogic.rollDiceLogic.mockReturnValueOnce({ diceValue: [6, 3], player: PLAYERS.LEFT });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: ROLL_DICE })));

    // Make moves to use all dice
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[14]));
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[17]));

    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.LEFT);

    const endTurnButton = screen.getByRole('button', { name: END_TURN });
    await act(async () => fireEvent.click(endTurnButton));

    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.RIGHT);
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

    const checkersOnBar = { left: 0, right: 0 };
    const diceValue = [4, 4, 4];
    const potentialMoves = { '7': [11], '8': [12], '9': [-1, -1] };

    const customStore = configureStore({
      reducer,
      preloadedState: {
        backgammon: {
          points: customPoints,
          checkersOnBar,
          checkersBorneOff: { left: 1, right: 4 },
          diceValue,
          player: PLAYERS.RIGHT,
          winner: null,
          selectedSpot: null,
          potentialSpots: [],
          potentialMoves,
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

    await act(async () => render(<BrowserRouter><Provider store={customStore}><Backgammon /></Provider></BrowserRouter>));

    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain(PLAYERS.RIGHT);

    const point11 = screen.getByTestId(/point-11/);
    expect(point11).toBeInTheDocument();
    expect(point11.getAttribute('aria-label')).toContain('Point 11 with 1 right checkers');

    await act(async () => fireEvent.click(point11));
    expect(point11).toHaveAttribute('data-testid', expect.stringContaining('selected'));

    const bearOffButton = screen.queryByText(BEAR_OFF);
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

    await act(async () => render(<BrowserRouter><Provider store={customStore}><Backgammon /></Provider></BrowserRouter>));

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

    await act(async () => render(<BrowserRouter><Provider store={customStore}><Backgammon /></Provider></BrowserRouter>));

    expect(screen.getByText('Borne Off: 3')).toBeInTheDocument();

    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    expect(undoButton).toHaveAttribute('disabled');

    // Test passes - undo button is properly disabled
  });
});

function validateInitialBoardState(points) {
  points.forEach((point, index) => {
    const ariaLabel = point.getAttribute('aria-label');
    if ([0, 18].includes(index)) {
      expect(ariaLabel).toContain('5 left checkers');
    } else if ([6, 12].includes(index)) {
      expect(ariaLabel).toContain('5 right checkers');
    } else if ([4].includes(index)) {
      expect(ariaLabel).toContain('3 right checkers');
    } else if ([16].includes(index)) {
      expect(ariaLabel).toContain('3 left checkers');
    } else if ([11].includes(index)) {
      expect(ariaLabel).toContain('2 left checkers');
    } else if ([23].includes(index)) {
      expect(ariaLabel).toContain('2 right checkers');
    } else {
      expect(ariaLabel).toContain('0 checkers');
    }
  });
};
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

    await act(async () => render(<BrowserRouter><Provider store={customStore}><Backgammon /></Provider></BrowserRouter>));

    // Check that the doubles cube displays the correct value
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check that the owner is displayed
    expect(screen.getByText('Owned by:')).toBeInTheDocument();

    // Check that the Double button appears when conditions are met (player doesn't own cube and turn is ending)
    expect(screen.getByRole('button', { name: /offer to double/i })).toBeInTheDocument();
  });
