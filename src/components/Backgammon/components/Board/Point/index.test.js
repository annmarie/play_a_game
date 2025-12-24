import { render, screen, fireEvent, act } from '@testing-library/react';
import Point from './index';
import { PLAYER } from '../../../globals';

describe('Point Component', () => {
  const mockOnClick = jest.fn();
  const mockPoint = {
    id: 1,
    checkers: 3,
    player: PLAYER.RIGHT
  };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render with the correct test data based on point id', async () => {
    await act(async () => render(<Point point={mockPoint} onClick={mockOnClick} />));
    const point = screen.getByLabelText(/Point 1 with 3 right checkers/);
    expect(point).toHaveAttribute('data-testid', expect.stringContaining('point dark top'));
  });

  it('should render the correct number of checkers', async () => {
    await act(async () => render(<Point point={mockPoint} onClick={mockOnClick} />));
    const checkers = screen.getAllByRole('checker');
    expect(checkers).toHaveLength(3);
  });

  it('should call onClick with the correct point object when clicked', async () => {
    await act(async () => render(<Point point={mockPoint} onClick={mockOnClick} />));
    const point = screen.getByLabelText(/Point 1 with 3 right checkers/);
    await act(async () => fireEvent.click(point));
    expect(mockOnClick).toHaveBeenCalledWith(mockPoint);
  });
});
