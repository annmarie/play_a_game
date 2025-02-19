import { useReducer } from 'react';
import { MAKE_MOVE, UNDO_MOVE, RESET_GAME } from './actionTypes';
import { UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT } from './globals';
import { reducer, initialState } from './reducer';
import StatusBox from './StatusBox';
import Board from './Board';
import './styles.css';

const Connect4 = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleCellClick = (col) => {
    dispatch({ type: MAKE_MOVE, payload: { col } });
  };

  return (
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
          onClick={() => dispatch({ type: UNDO_MOVE })}
          disabled={state.history.length === 0 || state.winner}
        >
          {UNDO_BUTTON_TEXT}
        </button>
        <button
          aria-label="Reset Game"
          onClick={() => dispatch({ type: RESET_GAME })}
          disabled={state.history.length === 0}
        >
          {RESET_BUTTON_TEXT}
        </button>
      </div>

    </div>
  );
};

export default Connect4;
