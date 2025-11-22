import PropTypes from 'prop-types';
import { PLAYER_ONE, PLAYER_TWO } from '../globals';
import './layout.css'

const Cell = ({ cell, rowIndex, colIndex, onCellClick }) => {
  const getPlayerClass = (cell) => {
    return cell === PLAYER_ONE ? 'player_one' : cell === PLAYER_TWO ? 'player_two' : '';
  };

  return (
    <div
      key={colIndex}
      className="connect4-cell"
      onClick={() => onCellClick(colIndex)}
      role="cell"
      aria-label={`Spot row ${rowIndex} and col ${colIndex} with ${cell || 'empty'}`}
    >
      {cell && (
        <div
          className={`checker ${getPlayerClass(cell)}`}
          data-testid={`checker-${cell || 'empty'}`}
        ></div>
      )}
    </div>
  );
};

Cell.propTypes = {
  cell: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowIndex: PropTypes.number.isRequired,
  colIndex: PropTypes.number.isRequired,
  onCellClick: PropTypes.func.isRequired,
};

export default Cell;
