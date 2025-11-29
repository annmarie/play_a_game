import { render, screen, act } from '@testing-library/react';
import Board from '../Board';

describe('Board Component', () => {
  const mockHandleCellClick = jest.fn();
  const mockBoard = [
    [null, 'X', 'O'],
    ['O', 'X', null],
    ['X', null, 'O'],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the board with the correct number of rows and cells', async () => {
    await act(async () => {
      render(<Board board={mockBoard} handleCellClick={mockHandleCellClick} />);
    });
    const rows = screen.getAllByRole('row');
    expect(rows.length).toEqual(3);
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toEqual(9);
  });

  it('should render the correct cell values', () => {
    render(<Board board={mockBoard} handleCellClick={mockHandleCellClick} />);

    mockBoard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        expect(screen.getByLabelText(`Spot row ${rowIndex} and col ${colIndex} with ${cell || 'empty'}`)).toBeInTheDocument();
      });
    });
  });
});
