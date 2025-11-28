import { useCallback, useEffect } from 'react';
import { UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, resetGame, loadTestBoard } from './slice';
import StatusBox from './StatusBox';
import Board from './Board';
import Header from '../Header';
import { encodeBoardState, decodeBoardState } from './boardEncoder';
import './layout.css';

const Connect4 = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.connect4);
  const handleCellClick = (col) => dispatch(makeMove({ col }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('board');
    if (encoded) {
      const boardState = decodeBoardState(encoded);
      if (boardState) {
        dispatch(loadTestBoard(boardState));
      }
    }
  }, [dispatch]);

  const handleSaveGameLink = useCallback(() => {
    const encoded = encodeBoardState(state);
    const url = `${window.location.origin}${window.location.pathname}?board=${encoded}`;
    navigator.clipboard.writeText(url);
    alert('Game link copied to clipboard!');
  }, [state]);

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
          <button
            onClick={handleSaveGameLink}
            disabled={state.history.length === 0 || state.winner}
            aria-label="Save game link"
          >
            Save Game Link
          </button>
        </div>

      </div>
    </div>
  );
};

export default Connect4;
