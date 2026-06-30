import { render, screen } from '@testing-library/react';
import Cell from '../Cell';
import { PLAYER } from '../../../globals';

describe('Cell Component (presentational)', () => {
  it('should render an empty cell correctly', () => {
    render(<Cell cell={null} />);
    const cellElement = screen.getByTestId('connect4-cell');
    expect(cellElement).toBeInTheDocument();
    expect(screen.queryByTestId('checker-empty')).not.toBeInTheDocument();
  });

  it('should render a cell with PLAYER_ONE correctly', () => {
    render(<Cell cell={PLAYER.ONE} />);
    expect(screen.getByTestId(`checker-${PLAYER.ONE}`)).toBeInTheDocument();
  });

  it('should render a cell with PLAYER_TWO correctly', () => {
    render(<Cell cell={PLAYER.TWO} />);
    expect(screen.getByTestId(`checker-${PLAYER.TWO}`)).toBeInTheDocument();
  });

  it('is presentational and hidden from assistive tech (the column button is the control)', () => {
    render(<Cell cell={PLAYER.ONE} />);
    const cellElement = screen.getByTestId('connect4-cell');
    expect(cellElement).toHaveAttribute('aria-hidden', 'true');
    expect(cellElement).not.toHaveAttribute('tabindex');
    expect(cellElement).not.toHaveAttribute('role');
  });
});
