import { UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, resetGame } from './slice';
import StatusBox from './StatusBox';
import Board from './Board';
import Header from '../Header';
import './layout.css';

const Connect4 = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.connect4);
  const handleCellClick = (col) => dispatch(makeMove({ col }));

  return (
    <div className="main">
      <Header />
      <div className="connect4-game">
        <h2 className="connect4-title">Connect Four</h2>

        <StatusBox
          player={state.player}
          winner={state.winner}
          winnerDesc={state.winnerDesc}
          boardFull={state.boardFull}
        />

        <Board
          board={state.board}
          handleCellClick={handleCellClick}
        />

        <div className="connect4-actions">
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
    </div>
  );
};

export default Connect4;
