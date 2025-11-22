import PropTypes from 'prop-types'
import './layout.css'

const Tile = ({ tile, rowIdx, colIdx, onClick }) => {
  const ariaLabel = `Tile at row ${rowIdx + 1} and column ${colIdx + 1}`
    + ` with ${tile !== 0 ? tile : 'empty'}`;
  return (
    <div
      role="cell"
      key={colIdx}
      aria-label={ariaLabel}
      className={`tile ${tile === 0 ? 'empty' : ''}`}
      onClick={() => onClick(rowIdx, colIdx)}
    >
      {tile !== 0 ? tile : ''}
    </div>
  );
};

Tile.propTypes = {
  tile: PropTypes.number.isRequired,
  rowIdx: PropTypes.number.isRequired,
  colIdx: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Tile;
