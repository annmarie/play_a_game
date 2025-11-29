import PropTypes from 'prop-types';
import { PLAYER_ONE, PLAYER_TWO } from '../globals';
import styles from './Cell.module.css'

const Cell = ({ cell, rowIndex, colIndex, onCellClick }) => {
  const getPlayerClass = (cell) => {
    if (cell === PLAYER_ONE) {
      return `${styles.playerOne} player_one`; // Keep original class for tests
    }
    if (cell === PLAYER_TWO) {
      return `${styles.playerTwo} player_two`; // Keep original class for tests
    }
    return '';
  };

  return (
    <div
      key={colIndex}
      className={`${styles.connect4Cell} connect4-cell`}
      onClick={() => onCellClick(colIndex)}
      role="cell"
      aria-label={`Spot row ${rowIndex} and col ${colIndex} with ${cell || 'empty'}`}
    >
      {cell && (
        <div
          className={`${styles.checker} checker ${getPlayerClass(cell)}`}
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
