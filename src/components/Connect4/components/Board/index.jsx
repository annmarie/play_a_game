import PropTypes from 'prop-types'
import Cell from './Cell'
import styles from './Board.module.css'

const Board = ({ board, handleCellClick }) => (

  <div className={styles.connect4Board}>
    {board.map((row, rowIndex) => (
      <div key={rowIndex} className={styles.connect4Row} role="row">
        {row.map((cell, colIndex) => (
          <Cell
            key={colIndex}
            cell={cell}
            rowIndex={rowIndex}
            colIndex={colIndex}
            onCellClick={handleCellClick}
          />
        ))}
      </div>
    ))}
  </div>
);

Board.propTypes = {
  board: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ).isRequired,
  handleCellClick: PropTypes.func.isRequired,
};

export default Board;
