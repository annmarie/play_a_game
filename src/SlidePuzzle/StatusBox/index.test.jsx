import { render, screen } from '@testing-library/react';
import StatusBox from '../StatusBox';

describe('StatusBox Component', () => {
  it('should render "Game Won" when isSolved is true', () => {
    render(<StatusBox isSolved={true} />);
    const statusElement = screen.getByRole('status', { name: /game status/i });
    expect(statusElement).toHaveTextContent('Game Won');
  });

  it('should render "Game On" when isSolved is false', () => {
    render(<StatusBox isSolved={false} />);
    const statusElement = screen.getByRole('status', { name: /game status/i });
    expect(statusElement).toHaveTextContent('Game On');
  });

  it('should have the correct aria attributes', () => {
    render(<StatusBox isSolved={false} />);
    const statusElement = screen.getByRole('status', { name: /game status/i });
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
    expect(statusElement).toHaveAttribute('aria-label', 'Game Status');
  });

  it('should render without crashing when no prop is passed', () => {
    render(<StatusBox />);
    const statusElement = screen.getByRole('status', { name: /game status/i });
    expect(statusElement).toHaveTextContent('Game On');
  });
});
