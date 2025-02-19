import { render, screen, act } from '@testing-library/react';
import Dice from '../Dice';

const DICE_DOT_LEFT_TEST_ID = /die-dot-left/i;
const DICE_DOT_EXTRA_LEFT_TEST_ID = /die-dot-doubles-left/i;
const DICE_DOT_RIGHT_TEST_ID = /die-dot-right/i;
const DICE_DOT_EXTRA_RIGHT_TEST_ID = /die-dot-doubles-right/i;

describe('Dice Component', () => {

  it('should render nothing when no props are passed', async () => {
    await act(async () => render(<Dice />));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(0);
  });

  it('should render nothing when diceValue passed is null', async () => {
    await act(async () => render(<Dice diceValue={null} />));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(0);
  });

  it('should render dice with diceValue', async () => {
    const [leftDie, rightDie] = [ 4, 6 ]
    await act(async () => render(<Dice diceValue={[leftDie, rightDie]} />));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(leftDie);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(rightDie);
    expect(screen.getByLabelText('Dice left showing 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Dice right showing 6')).toBeInTheDocument();
  });

  it('should render 4 die when diceValue is doubles', async () => {
    await act(async () => render(<Dice diceValue={[4,4,4,4]} />));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(4);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toBe(4);
    expect(screen.getByLabelText('Dice left showing 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Dice doubles-left showing 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Dice right showing 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Dice doubles-right showing 4')).toBeInTheDocument();
  });

  it('should render 3 die when diceValue is doubles', async () => {
    await act(async () => render(<Dice diceValue={[3,3,3]} />));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(3);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toBe(3);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(3);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.getByLabelText('Dice left showing 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Dice doubles-left showing 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Dice right showing 3')).toBeInTheDocument();
  });

  it('should render 2 die when diceValue is doubles', async () => {
    await act(async () => render(<Dice diceValue={[3,3]} />));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(3);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(3);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.getByLabelText('Dice left showing 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Dice right showing 3')).toBeInTheDocument();
  });

  it('should render 1 die when diceValue has one value', async () => {
    await act(async () => render(<Dice diceValue={[3]} />));
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(3);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toBe(0);
    expect(screen.getByLabelText('Dice left showing 3')).toBeInTheDocument();
  });
});
