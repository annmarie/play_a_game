import { render, screen, act } from '@testing-library/react';
import { setTiles } from '../utils';
import { SIZE } from '../globals';
import Board from '../Board';


describe("Tile Component Tests", () => {

  it('should render the puzzle grid and reset button', async () => {
  const onTileClick = jest.fn();
    const tiles = setTiles(SIZE, false);
    await act(async () => render(<Board tiles={tiles} onTileClick={onTileClick} />));
    const grids = screen.getAllByRole('grid');
    expect(grids.length).toEqual(1)
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toEqual(SIZE * SIZE)
  });
});
