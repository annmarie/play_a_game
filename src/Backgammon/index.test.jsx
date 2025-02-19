import { render, fireEvent, screen, act } from '@testing-library/react';
import Backgammon from '../Backgammon';
import * as utils from './utils';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  rollDie: jest.fn(),
}));

const PLAYER_LABEL = /current player [left|right]/i
const DICE_DOT_LEFT_TEST_ID = /die-dot-left/i;
const DICE_DOT_EXTRA_LEFT_TEST_ID = /die-dot-doubles-left/i;
const DICE_DOT_RIGHT_TEST_ID = /die-dot-right/i;
const DICE_DOT_EXTRA_RIGHT_TEST_ID = /die-dot-doubles-right/i;
const ROLL_DICE = /roll dice/i;
const RESET_GAME = /reset the game/i;
const UNDO_MOVE = /undo last move/i;

describe('Backgammon Component Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the initial board', async () => {
    await act(async () => render(<Backgammon />));
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
    await act(async () => render(<Backgammon />));
    const rollButton = screen.getByRole('button', { name: ROLL_DICE });
    utils.rollDie.mockReturnValueOnce(3).mockReturnValueOnce(5);
    await act(async () => fireEvent.click(rollButton));
    const points = screen.queryAllByRole('point');
    const playerLabel = screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')
    const cell = (playerLabel === 'Current player left') ? 0 : 4;
    await act(async () => fireEvent.click(points[cell]));
    expect(points[cell].className).toContain('selected')
  });

  it('should roll the dice and render the dots for each die', async () => {
    await act(async () => render(<Backgammon />));
    const rollButton = screen.getByRole('button', { name: ROLL_DICE });
    const resetButton = screen.getByRole('button', { name: RESET_GAME });
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    const [leftDie, rightDie] = [5, 3]
    utils.rollDie.mockReturnValueOnce(leftDie).mockReturnValueOnce(rightDie);
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
    await act(async () => render(<Backgammon />));
    const rollButton = screen.getByRole('button', { name: ROLL_DICE });
    const resetButton = screen.getByRole('button', { name: RESET_GAME });
    const undoButton = screen.getByRole('button', { name: UNDO_MOVE });
    const points = screen.queryAllByRole('point');
    expect(points[0].getAttribute('aria-label')).toContain('5 checkers')
    expect(points[14].getAttribute('aria-label')).toContain('0 checkers')
    utils.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(3);
    await act(async () => fireEvent.click(rollButton));
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[14]));
    expect(points[0].getAttribute('aria-label')).toContain('4 checkers')
    expect(points[14].getAttribute('aria-label')).toContain('1 checkers')
    expect(points[17].getAttribute('aria-label')).toContain('0 checkers')
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain('left')
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[17]));
    expect(points[17].getAttribute('aria-label')).toContain('1 checkers')
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toBe(0);
    await act(async () => fireEvent.click(resetButton));
    expect(resetButton).toHaveAttribute('disabled');
    expect(undoButton).toHaveAttribute('disabled');
    validateInitialBoardState(points);
  });

  it('should be able display four sets of die when doubles are rolled', async () => {
    await act(async () => render(<Backgammon />));
    const points = screen.queryAllByRole('point');
    // first roll cannot be doubles
    utils.rollDie.mockReturnValueOnce(6).mockReturnValueOnce(3);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: ROLL_DICE })));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(6);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(3);
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain('left')
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[14]));
    await act(async () => fireEvent.click(points[0]));
    await act(async () => fireEvent.click(points[17]));
    expect(screen.getByLabelText(PLAYER_LABEL).getAttribute('aria-label')).toContain('right')
    // second move will be doubles
    utils.rollDie.mockReturnValueOnce(4).mockReturnValueOnce(4);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: ROLL_DICE })));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toBe(4);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: RESET_GAME })));
    expect(screen.getByRole('button', { name: RESET_GAME })).toHaveAttribute('disabled');
    expect(screen.getByRole('button', { name: UNDO_MOVE })).toHaveAttribute('disabled');
    validateInitialBoardState(points);
  });

  it('should roll the dice when the spacebar is pressed and diceValue is null', async () => {
    await act(async () => render(<Backgammon />));
    const rollButton = screen.getByRole('button', { name: ROLL_DICE });
    expect(rollButton).toBeInTheDocument();
    utils.rollDie.mockReturnValueOnce(4).mockReturnValueOnce(6);
    await act(async () => fireEvent.keyDown(window, { key: ' ' }));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(6);
  });

  it('should not roll the dice when the spacebar is pressed and diceValue is not null', async () => {
    await act(async () => render(<Backgammon />));
    expect(screen.getByRole('button', { name: ROLL_DICE })).toBeInTheDocument();
    utils.rollDie.mockReturnValueOnce(4).mockReturnValueOnce(6);
    await act(async () => fireEvent.keyDown(window, { key: ' ' }))
    utils.rollDie.mockReturnValueOnce(1).mockReturnValueOnce(3);
    await act(async () => fireEvent.keyDown(window, { key: ' ' }))
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(6);
  });

  it('should undo the dice roll when the "u" key is pressed', async () => {
    await act(async () => render(<Backgammon />));
    expect(screen.getByRole('button', { name: ROLL_DICE })).toBeInTheDocument();
    utils.rollDie.mockReturnValueOnce(4).mockReturnValueOnce(6);
    await act(async () => fireEvent.keyDown(window, { key: ' ' }))
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(6);
    await act(async () => fireEvent.keyDown(window, { key: 'u' }))
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(0);
  });

  it('should clean up the event listener on unmount', async () => {
    const { unmount } = await act(async () => render(<Backgammon />));
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

function validateInitialBoardState(points) {
  points.forEach((point, index) => {
    const ariaLabel = point.getAttribute('aria-label');
    if ([0, 6, 12, 18].includes(index)) {
      expect(ariaLabel).toContain('5 checkers');
    } else if ([4, 16].includes(index)) {
      expect(ariaLabel).toContain('3 checkers');
    } else if ([11, 23].includes(index)) {
      expect(ariaLabel).toContain('2 checkers');
    } else {
      expect(ariaLabel).toContain('0 checkers');
    }
  });
};
