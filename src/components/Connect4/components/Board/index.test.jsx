import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders one column button per column and a cell per slot', () => {
    render(<Board board={mockBoard} handleCellClick={mockHandleCellClick} />);

    const columns = screen.getAllByRole('button', { name: /drop in column/i });
    expect(columns).toHaveLength(3);
    expect(screen.getAllByTestId('connect4-cell')).toHaveLength(9);
  });

  it('renders the correct discs for occupied slots', () => {
    render(<Board board={mockBoard} handleCellClick={mockHandleCellClick} />);

    expect(screen.getAllByTestId('checker-X')).toHaveLength(3);
    expect(screen.getAllByTestId('checker-O')).toHaveLength(3);
  });

  it('drops into a column on click and via keyboard', () => {
    // Column 0 is the only open column in mockBoard (its top slot is null).
    render(<Board board={mockBoard} handleCellClick={mockHandleCellClick} />);
    const columns = screen.getAllByRole('button', { name: /drop in column/i });

    fireEvent.click(columns[0]);
    fireEvent.keyDown(columns[0], { key: 'Enter' });
    fireEvent.keyDown(columns[0], { key: ' ' });
    expect(mockHandleCellClick).toHaveBeenCalledTimes(3);
    expect(mockHandleCellClick).toHaveBeenCalledWith(0);

    // A non-activation key does nothing.
    fireEvent.keyDown(columns[0], { key: 'a' });
    expect(mockHandleCellClick).toHaveBeenCalledTimes(3);
  });

  it('does not drop into a full column (top slot occupied)', () => {
    // Column index 1 has its top slot filled ('X') -> full.
    render(<Board board={mockBoard} handleCellClick={mockHandleCellClick} />);
    const columns = screen.getAllByRole('button', { name: /drop in column/i });

    expect(columns[1]).toHaveAttribute('aria-disabled', 'true');
    expect(columns[1]).toHaveAttribute('tabindex', '-1');
    fireEvent.click(columns[1]);
    expect(mockHandleCellClick).not.toHaveBeenCalled();
  });

  it('disables every column when the board is disabled', () => {
    render(<Board board={mockBoard} handleCellClick={mockHandleCellClick} disabled />);
    const columns = screen.getAllByRole('button', { name: /drop in column/i });

    columns.forEach((col) => fireEvent.click(col));
    expect(mockHandleCellClick).not.toHaveBeenCalled();
  });
});
