import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, resetGame, selectPeg } from './slice';
import Cell from './Cell'
import './styles.css';

const PegSolitaire = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.pegsolitaire);

  const handleCellClick = (row, col) => {
    const cellValue = state.board[row][col];
    if (cellValue === 1) {
      dispatch(selectPeg({ row, col }));
    } else if (cellValue === 0 && state.selectedPeg) {
      dispatch(makeMove({ endRow: row, endCol: col }));
    }
  };

  return (
    <div className="peg-game">
      <div
        aria-label="Game Status"
        className="peg-game-status"
        role="status"
        aria-live="polite"
      >
        {state.winner
          ? 'Game Won'
          : state.movesLeft === false
            ? 'No moves left'
            : 'Jump the pegs to the open spot'}
      </div>

      <div
        className="peg-board"
        role="grid"
        aria-label="Peg Solitaire Board"
      >
        {state.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              rowIndex={rowIndex}
              colIndex={colIndex}
              cellValue={cell}
              selectedPeg={state.selectedPeg}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          )))}
      </div>

      <div className="peg-actions">
        <button
          aria-label="Undo the last move"
          onClick={() => dispatch(undoMove())}
          disabled={state.history.length === 0 || state.winner}
        >
          Undo Move
        </button>
        <button
          aria-label="Reset the game to its initial state"
          onClick={() => dispatch(resetGame())}
          disabled={state.history.length === 0}
        >
          Reset Game
        </button>
      </div>
    </div >
  );
};

export default PegSolitaire;
