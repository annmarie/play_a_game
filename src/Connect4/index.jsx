import { useCallback, useEffect } from 'react';
import { UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, resetGame, loadFromURL, saveToURL } from './slice';
import StatusBox from './StatusBox';
import Board from './Board';
import styles from './Connect4.module.css';
import Layout from '../Layout';

const Connect4 = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.connect4);
  const handleCellClick = (col) => dispatch(makeMove({ col }));

  useEffect(() => {
    dispatch(loadFromURL());
  }, [dispatch]);

  const handleSaveGameLink = useCallback(() => {
    try {
      dispatch(saveToURL());
      alert('Game link copied to clipboard!');
    } catch (error) {
      alert('Failed to save game link. Please try again.');
      console.error('Error saving game link:', error);
    }
  }, [dispatch]);

  return (
    <Layout>
      <div className={styles.connect4Game}>
        <h2 className={styles.connect4Title}>Connect Four</h2>

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

        <div className={styles.connect4Actions}>
          <button
            aria-label="Undo Move"
            onClick={() => dispatch(undoMove())}
            disabled={state.history.length <= 1 || state.winner}
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
    </Layout>
  );
};

export default Connect4;
