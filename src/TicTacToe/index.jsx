import { DRAW_MESSAGE, UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, resetGame } from './slice';
import './styles.css';

const TicTacToe = () => {
  const dispatch = useDispatch();
  const handleCellClick = (index) => { dispatch(makeMove(index)); };
  const state = useSelector((state) => state.tictactoe );

  return (
    <div className="tic-tac-toe-game">
      <h3 style={{ margin: '0 0 10px 0' }}>Tic Tac Toe</h3>
      <div
        aria-label="Game Status"
        className="tic-tac-toe-status"
        role="status"
        aria-live="polite"
      >
        {state.winner ? `Winner: ${state.winner}` : state.boardFull
            ? DRAW_MESSAGE : `Player: ${state.player}`}
      </div>

      <div className="tic-tac-toe-board">
        <div className="tic-tac-toe-cells">
          {state.board.map((cell, index) => (
            <div
              key={index}
              className={`tic-tac-toe-cell ${cell || 'empty'}`}
              onClick={() => handleCellClick(index)}
              aria-label={`Cell ${index}: ${cell || 'empty'}`}
              role="cell"
            >
              {cell}
            </div>
          ))}
        </div>
      </div>

      <div className="tic-tac-toe-actions">
        <button
          aria-label="Undo Move"
          onClick={() => dispatch(undoMove())}
          disabled={state.history.length === 0 || state.winner}
        >
          {UNDO_BUTTON_TEXT}
        </button>
        <button
          aria-label="Reset Game"
          onClick={() => dispatch(resetGame())}
          disabled={state.history.length === 0}
        >
          {RESET_BUTTON_TEXT}
        </button>
      </div>
    </div>
  );
};

export default TicTacToe;
