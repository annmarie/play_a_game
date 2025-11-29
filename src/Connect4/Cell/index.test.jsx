import { render, screen, fireEvent, act } from '@testing-library/react';
import Cell from '../Cell';
import { PLAYER_ONE, PLAYER_TWO } from '../globals';

describe('Cell Component', () => {
  const mockOnCellClick = jest.fn();

  it('should render an empty cell correctly', async () => {
    render(
      <Cell
        cell={null}
        rowIndex={0}
        colIndex={0}
        onCellClick={mockOnCellClick}
      />
    );
    const cellElement = screen.getByTestId('connect4-cell');
    expect(cellElement).toBeInTheDocument();
    expect(cellElement).not.toContainHTML('<div class="checker">');
  });

  it('should render a cell with PLAYER_ONE correctly', async () => {
    render(
      <Cell
        cell={PLAYER_ONE}
        rowIndex={1}
        colIndex={2}
        onCellClick={mockOnCellClick}
      />
    );
    const checkerElement = screen.getByTestId(`checker-${PLAYER_ONE}`);
    expect(checkerElement).toBeInTheDocument();
  });

  it('should render a cell with PLAYER_TWO correctly', async () => {
    render(
      <Cell
        cell={PLAYER_TWO}
        rowIndex={2}
        colIndex={3}
        onCellClick={mockOnCellClick}
      />
    );
    const checkerElement = screen.getByTestId(`checker-${PLAYER_TWO}`);
    expect(checkerElement).toBeInTheDocument();
  });

  it('should call onCellClick with the correct column index when clicked', async () => {
    render(
      <Cell
        cell={null}
        rowIndex={0}
        colIndex={4}
        onCellClick={mockOnCellClick}
      />
    );
    const cellElement = screen.getByTestId('connect4-cell');
    fireEvent.click(cellElement);
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
