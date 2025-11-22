import PropTypes from 'prop-types'
import Tile from '../Tile'
import './layout.css'

const Board = ({ tiles, onTileClick }) => (
  <div
    className="slide-puzzle-board"
    aria-label="Slide Puzzle Board"
    role="grid"
  >
    {tiles.map((row, rowIdx) => (
      <div key={rowIdx} className="row">
        {row.map((tile, colIdx) => (
          <Tile
            key={colIdx}
            tile={tile}
            rowIdx={rowIdx}
            colIdx={colIdx}
            onClick={onTileClick}
          />
        ))}
      </div>
    ))}
  </div>
);

Board.propTypes = {
  tiles: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.number).isRequired
  ).isRequired,
  onTileClick: PropTypes.func.isRequired,
};

export default Board;