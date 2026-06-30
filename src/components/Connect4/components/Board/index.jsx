import PropTypes from 'prop-types'
import Cell from './Cell'
import styles from './Board.module.css'

const Board = ({ board, handleCellClick, disabled = false }) => {
  const colCount = board[0]?.length ?? 0;

  const activateColumn = (colIndex, columnFull) => {
    if (disabled || columnFull) return;
    handleCellClick(colIndex);
  };

  return (
    <div className={styles.connect4Board} role="group" aria-label="Connect Four board">
      {Array.from({ length: colCount }, (_, colIndex) => {
        // A column is full when its top cell is occupied.
        const columnFull = board[0][colIndex] != null;
        const isDisabled = disabled || columnFull;

        return (
          <div
            key={colIndex}
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            aria-label={`Drop in column ${colIndex + 1}${columnFull ? ', column full' : ''}`}
            aria-disabled={isDisabled || undefined}
            className={styles.connect4Column}
            onClick={() => activateColumn(colIndex, columnFull)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateColumn(colIndex, columnFull);
              }
            }}
          >
            {board.map((row, rowIndex) => (
              <Cell key={rowIndex} cell={row[colIndex]} />
            ))}
          </div>
        );
      })}
    </div>
  );
};

Board.propTypes = {
  board: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ).isRequired,
  handleCellClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Board;
