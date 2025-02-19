import PropTypes from 'prop-types'
import Cell from '../Cell'
import './styles.css'

const Board = ({ board, handleCellClick }) => (

  <div className="connect4-board">
    {board.map((row, rowIndex) => (
      <div key={rowIndex} className="connect4-row" role="row">
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
