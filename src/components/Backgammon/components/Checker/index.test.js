import { render, screen } from '@testing-library/react';
import Checker from './index';
import { PLAYERS } from '../../globals';

describe('Checker Component', () => {
  it('should render the checker div', () => {
    render(<Checker player={PLAYERS.RIGHT} selected={false} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).toBeInTheDocument();
  });

  it('should apply the correct ID for PLAYER_RIGHT', () => {
    render(<Checker player={PLAYERS.RIGHT} selected={false} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).toHaveAttribute('id', 'player_right');
  });

  it('should apply the correct ID for PLAYER_LEFT', () => {
    render(<Checker player={PLAYERS.LEFT} selected={false} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).toHaveAttribute('id', 'player_left');
  });

  it('should apply the "selected" class when selected is true', () => {
    render(<Checker player={PLAYERS.RIGHT} selected={true} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).toHaveClass('selected');
  });

  it('should not apply the "selected" class when selected is false', () => {
    render(<Checker player={PLAYERS.RIGHT} selected={false} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).not.toHaveClass('selected');
  });
});
