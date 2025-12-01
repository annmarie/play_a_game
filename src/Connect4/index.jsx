import { useCallback, useEffect } from 'react';
import { UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT, PLAYER_ONE, PLAYER_TWO } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, resetGame, playAgain, loadTestBoard, loadFromURL, saveToURL } from './slice';
import StatusBox from './StatusBox';
import Board from './Board';
import styles from './Connect4.module.css';
import Layout from '../Layout';
import TestBoardLoader from '../TestBoardLoader';
import { testBoards } from './testBoards';

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

  const handleLoadTestBoard = useCallback((testBoard) => {
    dispatch(loadTestBoard(testBoard));
  }, [dispatch]);

  return (
    <Layout>
      <div className={styles.connect4Game}>
        <h2 className={styles.connect4Title}>Connect Four</h2>

        <div className={styles.gameScore}>
          <div>Games Won:</div>
          <div style={{color: 'red'}}>{PLAYER_ONE}: {state.gamesWon?.[PLAYER_ONE] || 0}</div>
          <div style={{color: 'yellow'}}>{PLAYER_TWO}: {state.gamesWon?.[PLAYER_TWO] || 0}</div>
        </div>

        <StatusBox
          player={state.player}
          winner={state.winner}
          winnerDesc={state.winnerDesc}
          boardFull={state.boardFull}
          onPlayAgain={() => dispatch(playAgain())}
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

        <div className={styles.connect4Debug}>
          <TestBoardLoader
            testBoards={testBoards}
            onLoadTestBoard={handleLoadTestBoard}
          />
        </div>

      </div>
    </Layout>
  );
};

export default Connect4;
