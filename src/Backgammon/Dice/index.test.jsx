import { render, screen, act } from '@testing-library/react';
import Dice from '../Dice';

const DICE_DOT_LEFT_TEST_ID = /die-dot-left/i;
const DICE_DOT_EXTRA_LEFT_TEST_ID = /die-dot-doubles-left/i;
const DICE_DOT_RIGHT_TEST_ID = /die-dot-right/i;
const DICE_DOT_EXTRA_RIGHT_TEST_ID = /die-dot-doubles-right/i;

describe('Dice Component', () => {

  function renderAndAssertDice({
    diceValue,
    leftCount = 0,
    extraLeftCount = 0,
    rightCount = 0,
    extraRightCount = 0,
    leftLabel,
    extraLeftLabel,
    rightLabel,
    extraRightLabel,
  }) {
    render(<Dice diceValue={diceValue} />);
    expect(screen.queryAllByTestId(DICE_DOT_LEFT_TEST_ID).length).toBe(leftCount);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_LEFT_TEST_ID).length).toBe(extraLeftCount);
    expect(screen.queryAllByTestId(DICE_DOT_RIGHT_TEST_ID).length).toBe(rightCount);
    expect(screen.queryAllByTestId(DICE_DOT_EXTRA_RIGHT_TEST_ID).length).toBe(extraRightCount);
    if (leftLabel) expect(screen.getByLabelText(leftLabel)).toBeInTheDocument();
    if (extraLeftLabel) expect(screen.getByLabelText(extraLeftLabel)).toBeInTheDocument();
    if (rightLabel) expect(screen.getByLabelText(rightLabel)).toBeInTheDocument();
    if (extraRightLabel) expect(screen.getByLabelText(extraRightLabel)).toBeInTheDocument();
  }

  it('should render nothing when no props are passed', () => {
    renderAndAssertDice({ diceValue: undefined });
  });

  it('should render nothing when diceValue passed is null', () => {
    renderAndAssertDice({ diceValue: null });
  });

  it('should render dice with diceValue', () => {
    renderAndAssertDice({
      diceValue: [4, 6],
      leftCount: 4,
      rightCount: 6,
      leftLabel: 'Dice left showing 4',
      rightLabel: 'Dice right showing 6',
    });
  });

  it('should render 4 die when diceValue is doubles', () => {
    renderAndAssertDice({
      diceValue: [4, 4, 4, 4],
      leftCount: 4,
      extraLeftCount: 4,
      rightCount: 4,
      extraRightCount: 4,
      leftLabel: 'Dice left showing 4',
      extraLeftLabel: 'Dice doubles-left showing 4',
      rightLabel: 'Dice right showing 4',
      extraRightLabel: 'Dice doubles-right showing 4',
    });
  });

  it('should render 3 die when diceValue is doubles', () => {
    renderAndAssertDice({
      diceValue: [3, 3, 3],
      leftCount: 3,
      extraLeftCount: 3,
      rightCount: 3,
      extraRightCount: 0,
      leftLabel: 'Dice left showing 3',
      extraLeftLabel: 'Dice doubles-left showing 3',
      rightLabel: 'Dice right showing 3',
    });
  });

  it('should render 2 die when diceValue is doubles', () => {
    renderAndAssertDice({
      diceValue: [3, 3],
      leftCount: 3,
      extraLeftCount: 0,
      rightCount: 3,
      extraRightCount: 0,
      leftLabel: 'Dice left showing 3',
      rightLabel: 'Dice right showing 3',
    });
  });

  it('should render 1 die when diceValue has one value', () => {
    renderAndAssertDice({
      diceValue: [3],
      leftCount: 3,
      extraLeftCount: 0,
      rightCount: 0,
      extraRightCount: 0,
      leftLabel: 'Dice left showing 3',
    });
  });
});
