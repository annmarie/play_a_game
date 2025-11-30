import { render, screen } from '@testing-library/react';
import { PLAYER_RIGHT, PLAYER_LEFT } from '../globals';
import Checker from '.';

describe('Checker Component', () => {
  it('should render the checker div', () => {
    render(<Checker player={PLAYER_RIGHT} selected={false} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).toBeInTheDocument();
  });

  it('should apply the correct ID for PLAYER_RIGHT', () => {
    render(<Checker player={PLAYER_RIGHT} selected={false} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).toHaveAttribute('id', 'player_right');
  });

  it('should apply the correct ID for PLAYER_LEFT', () => {
    render(<Checker player={PLAYER_LEFT} selected={false} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).toHaveAttribute('id', 'player_left');
  });

  it('should apply the "selected" class when selected is true', () => {
    render(<Checker player={PLAYER_RIGHT} selected={true} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).toHaveClass('selected');
  });

  it('should not apply the "selected" class when selected is false', () => {
    render(<Checker player={PLAYER_RIGHT} selected={false} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).not.toHaveClass('selected');
  });

  it('should render with player_left ID if player prop is invalid', () => {
    render(<Checker player="INVALID_PLAYER" selected={false} />);
    const checkerElement = screen.getByRole('checker');
    expect(checkerElement).toHaveAttribute('id', 'player_left');
  });
});
