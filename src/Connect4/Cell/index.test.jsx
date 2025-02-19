import { render, screen, fireEvent, act } from '@testing-library/react';
import Cell from '../Cell';
import { PLAYER_ONE, PLAYER_TWO } from '../globals';

describe('Cell Component', () => {
  const mockOnCellClick = jest.fn();

  it('should render an empty cell correctly', async () => {
    await act(async () => render(
      <Cell
        cell={null}
        rowIndex={0}
        colIndex={0}
        onCellClick={mockOnCellClick}
      />
    ));
    const cellElement = screen.getByRole('cell', { name: /Spot row 0 and col 0 with empty/i });
    expect(cellElement).toBeInTheDocument();
    expect(cellElement).toHaveClass('connect4-cell');
    expect(cellElement).not.toContainHTML('<div class="checker">');
  });

  it('should render a cell with PLAYER_ONE correctly', async () => {
    await act(async () => render(
      <Cell
        cell={PLAYER_ONE}
        rowIndex={1}
        colIndex={2}
        onCellClick={mockOnCellClick}
      />
    ));
    const checkerElement = screen.getByTestId(`checker-${PLAYER_ONE}`);
    expect(checkerElement).toBeInTheDocument();
    expect(checkerElement).toHaveClass('checker player_one');
  });

  it('should render a cell with PLAYER_TWO correctly', async () => {
    await act(async () => render(
      <Cell
        cell={PLAYER_TWO}
        rowIndex={2}
        colIndex={3}
        onCellClick={mockOnCellClick}
      />
    ));
    const checkerElement = screen.getByTestId(`checker-${PLAYER_TWO}`);
    expect(checkerElement).toBeInTheDocument();
    expect(checkerElement).toHaveClass('checker player_two');
  });

  it('should call onCellClick with the correct column index when clicked', async () => {
    await act(async () => render(
      <Cell
        cell={null}
        rowIndex={0}
        colIndex={4}
        onCellClick={mockOnCellClick}
      />
    ));
    const cellElement = screen.getByRole('cell', { name: /Spot row 0 and col 4 with empty/i });
    await act(async () => fireEvent.click(cellElement));
    expect(mockOnCellClick).toHaveBeenCalledTimes(1);
    expect(mockOnCellClick).toHaveBeenCalledWith(4);
  });

  it('should not render a checker if the cell is empty', async () => {
    await act(async () => render(
      <Cell
        cell={null}
        rowIndex={0}
        colIndex={0}
        onCellClick={mockOnCellClick}
      />
    ));
    const checkerElement = screen.queryByTestId('checker-empty');
    expect(checkerElement).not.toBeInTheDocument();
  });
});
