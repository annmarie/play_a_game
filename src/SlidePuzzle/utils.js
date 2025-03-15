/**
 * Generates a 2D array representing the tiles of a sliding puzzle.
 * @param {number} size - The size of the puzzle (e.g., 3 for a 3x3 puzzle).
 * @param {boolean} ordered - If true, the tiles will be in order; if false, the tiles will be shuffled.
 * @returns {number[][]} - A 2D array representing the puzzle tiles
 */
export function setTiles(size, ordered) {
  const arrayLen = size * size;
  const tiles = Array.from({ length: arrayLen }, (_, index) => {
    const val = index + 1;
    return val === arrayLen ? 0 : val;
  });

  if (!ordered) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[randomIndex]] = [tiles[randomIndex], tiles[i]];
    }
  }

  return Array.from({ length: size }, (_, row) =>
    tiles.slice(row * size, row * size + size)
  );
}

/**
 * Finds the position of the empty tile (represented by 0) in the puzzle.
 * @param {number[][]} tiles - A 2D array representing the puzzle tiles.
 * @returns {{row: number, col: number}} - An object containing the row and column indices of the empty tile.
 */
export function findEmptyTile(tiles) {
  for (let r = 0; r < tiles.length; r++) {
    for (let c = 0; c < tiles[r].length; c++) {
      if (tiles[r][c] === 0) {
        return { row: r, col: c };
      }
    }
  }
}

/**
 * Checks if a move is valid by determining if the move tile is adjacent to the empty tile.
 * @param {{row: number, col: number}} emptyTile - The position of the empty tile.
 * @param {{row: number, col: number}} moveTile - The position of the tile to be moved.
 * @returns {boolean} - Returns true if the move is valid, otherwise false.
 */
export function moveIsValid(emptyTile, moveTile) {
  const { row: eRow, col: eCol } = emptyTile;
  const { row: mRow, col: mCol } = moveTile;

  return (
    (Math.abs(eRow - mRow) === 1 && eCol === mCol) ||
    (Math.abs(eCol - mCol) === 1 && eRow === mRow)
  );
}

/**
 * Executes a move by swapping the empty tile with the specified tile.
 * @param {number[][]} tiles - A 2D array representing the puzzle tiles.
 * @param {{row: number, col: number}} emptyTile - The position of the empty tile.
 * @param {{row: number, col: number}} moveTile - The position of the tile to be moved.
 * @returns {number[][]} - A new 2D array representing the updated puzzle tiles after the move.
 */
export function makeMove(tiles, emptyTile, moveTile) {
  const newTiles = tiles.map((row) => [...row]);
  const { row: eRow, col: eCol } = emptyTile;
  const { row: mRow, col: mCol } = moveTile;
  newTiles[eRow][eCol] = tiles[mRow][mCol];
  newTiles[mRow][mCol] = 0;
  return newTiles;
}

/**
 * Checks if the puzzle is solved by comparing the current tiles with the ordered tiles.
 * @param {number[][]} tiles - A 2D array representing the puzzle tiles.
 * @returns {boolean} - Returns true if the puzzle is solved, otherwise false.
 */
export function puzzleIsSolved(tiles) {
  const orderedTiles = setTiles(tiles.length, true).flat();
  const currentTiles = tiles.flat();
  return orderedTiles.every((value, index) => value === currentTiles[index]);
}
