import React from 'react';
import { render, screen } from '@testing-library/react';
import Board from '../Board';

describe('Board Component', () => {
  const mockHandleSpotClick = jest.fn();
  const mockPoints = [
    { id: 1, player: 'PLAYER_LEFT', checkers: 2 },
    { id: 2, player: 'PLAYER_RIGHT', checkers: 3 },
    { id: 3, player: null, checkers: 0 },
  ];
  const mockSelectedSpot = 1;
  const mockPotentialSpots = [2, 3];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all points', () => {
    render(
      <Board
        points={mockPoints}
        selectedSpot={mockSelectedSpot}
        potentialSpots={mockPotentialSpots}
        handleSpotClick={mockHandleSpotClick}
      />
    );
    mockPoints.forEach((point) => {
      expect(screen.getByLabelText(`Point ${point.id} with ${point.checkers} ${point.player ? point.player + ' ' : ''}checkers`)).toBeInTheDocument();
    });
  });

  it('should apply "selected or potential" class to selected and potential spots', () => {
    render(
      <Board
        points={mockPoints}
        selectedSpot={mockSelectedSpot}
        potentialSpots={mockPotentialSpots}
        handleSpotClick={mockHandleSpotClick}
      />
    );

    expect(screen.getByTestId('point-1')).toHaveClass('selected');
    expect(screen.getByTestId('point-2')).toHaveClass('potential');
    expect(screen.getByTestId('point-3')).toHaveClass('potential');
    const nonSelectedPoints = mockPoints.filter(
      (point) => ![mockSelectedSpot, ...mockPotentialSpots].includes(point.id)
    );
    nonSelectedPoints.forEach((point) => {
      expect(screen.getByTestId(`point-${point.id}`)).not.toHaveClass('selected');
    });
  });

  it('should render correctly with no selected or potential spots', () => {
    render(
      <Board
        points={mockPoints}
        selectedSpot={null}
        potentialSpots={[]}
        handleSpotClick={mockHandleSpotClick}
      />
    );

    mockPoints.forEach((point) => {
      expect(screen.getByTestId(`point-${point.id}`)).not.toHaveClass('selected');
    });
  });
});
