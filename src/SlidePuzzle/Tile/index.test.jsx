import { render, screen, act } from '@testing-library/react';
import Tile from '../Tile';


describe('Board Component Tests', () => {
  const onClick = jest.fn();

  it('should render the puzzle grid and reset button', async () => {
    const tiles = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0]
    ];
    await act(async () => render(<Tile tile={1} rowIdx={1} colIdx={1} onClick={onClick} />));
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toEqual(1)
  });
});

