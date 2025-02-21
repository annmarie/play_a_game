import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PLAYER_RIGHT } from '../globals';
import Point from '../Point';

describe('Point Component', () => {
  const mockPoint = {
    id: 1,
    checkers: 3,
    player: PLAYER_RIGHT,
  };

  const mockOnClick = jest.fn();

  it('should render with the correct class based on point id', async () => {
    await act(async () => render(<Point point={mockPoint} onClick={mockOnClick} />));
    const point = screen.getByLabelText(/Point 1 with 3 right checkers/);
    expect(point).toHaveClass('point dark top');
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
