import PropTypes from 'prop-types';
import { PLAYER } from '../../../globals';
import styles from './Cell.module.css'

// Presentational only: interaction lives on the parent column button (see Board).
const Cell = ({ cell }) => {
  const isOccupied = Boolean(cell);
  const checkerTestId = `checker-${cell || 'empty'}`;
  const playerClass = cell === PLAYER.ONE ? styles.playerOne : cell === PLAYER.TWO ? styles.playerTwo : '';

  return (
    <div className={styles.connect4Cell} data-testid="connect4-cell" aria-hidden="true">
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
};

export default Cell;
