import PropTypes from 'prop-types';
import { PLAYERS } from '../../globals';
import styles from './Cell.module.css'

const Cell = ({ cell, rowIndex, colIndex, onCellClick }) => {
  const isOccupied = Boolean(cell);
  const checkerTestId = `checker-${cell || 'empty'}`;
  const playerClass = cell === PLAYERS.ONE ? styles.playerOne : cell === PLAYERS.TWO ? styles.playerTwo : '';

  return (
    <div
      className={styles.connect4Cell}
      onClick={() => onCellClick(colIndex)}
      role="cell"
      aria-label={`Spot row ${rowIndex} and col ${colIndex} with ${cell || 'empty'}`}
      data-testid="connect4-cell"
    >
      {isOccupied && (
        <div
          className={`${styles.checker} ${playerClass}`}
          data-testid={checkerTestId}
        />
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
