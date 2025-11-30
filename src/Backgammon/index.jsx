// Backgammon Main Component
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT,
  ROLL_DICE_BUTTON_TEXT,
  PLAYER_LEFT, PLAYER_RIGHT
} from './globals';
import {
  makeMove, rollDice, undoRoll, togglePlayerRoll, resetGame,
  playAgain, selectSpot, loadTestBoard, loadFromURL, saveToURL
} from './slice';
import Dice from './Dice';
import Board from './Board';
import Checker from './Checker';
import DoublesCube from './DoublesCube';
import styles from './Backgammon.module.css';
import Layout from '../Layout';
import { useDispatch } from 'react-redux';
import { testBoards } from './testBoards';
import TestBoardLoader from '../TestBoardLoader';

const Backgammon = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.backgammon);

  useEffect(() => {
    dispatch(loadFromURL());
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        if (state.diceValue === null) {
          dispatch(rollDice());
        }
      }
      if (e.key === 'u') {
        dispatch(undoRoll());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.diceValue, dispatch]);

  const handleSpotClick = useCallback(
    (point) => {
      if (state.selectedSpot) {
        const fromPointId = state.selectedSpot;
        const toPointId = point.id;
        dispatch(makeMove({ fromPointId, toPointId }));
      }
      dispatch(selectSpot(point.id));
    },
    [state.selectedSpot, dispatch]
  );

  const handleSaveGameLink = useCallback(async () => {
    try {
      const actionResult = dispatch(saveToURL());
      if (actionResult?.error) {
        throw actionResult.error;
      }
      alert('Game link copied to clipboard!');
    } catch (err) {
      console.error('Failed to save game link:', err);
      alert('Failed to copy game link to clipboard.');
    }
  }, [dispatch]);

  const handleLoadTestBoard = useCallback((testBoard) => {
    dispatch(loadTestBoard(testBoard));
  }, [dispatch]);

  return (
    <Layout>
      <div className={styles.backgammonGame}>
        <div className={styles.gameScore}>
          <div className={styles.gameScoreLeft}>
            <div>Games Won:</div>
            <div className={styles.scoreRow}>
              <div><Checker player={PLAYER_LEFT} /> {state.gamesWon?.[PLAYER_LEFT] || 0}</div>
              <div><Checker player={PLAYER_RIGHT} /> {state.gamesWon?.[PLAYER_RIGHT] || 0}</div>
            </div>
          </div>
          <DoublesCube
            doublingCube={state.doublingCube}
            currentPlayer={state.player}
            winner={state.winner}
            diceValue={state.diceValue}
          />
        </div>

        {state.winner && (
          <div className="winner-announcement">
            🎉 Winner: <Checker player={state.winner} />
            <button
              className={styles.playAgainButton}
              onClick={() => dispatch(playAgain())}
              aria-label="Play another game"
            >
              Play Again
            </button>
          </div>
        )}

        <Board
          points={state.points}
          selectedSpot={state.selectedSpot}
          potentialSpots={state.potentialSpots}
          handleSpotClick={handleSpotClick}
          potentialMoves={state.potentialMoves}
        />

        <div className={styles.backgammonStatus}>
          <div>
            {state.diceValue ? (
              <Dice diceValue={state.diceValue} />
            ) : (
              <div className="dice-roll">
                {state.player &&
                 !state.winner &&
                 !state.doublingCube.pendingOffer &&
                 state.doublingCube.owner !== state.player &&
                 state.doublingCube.value < 64 ? (
                  <div className={styles.doubleOrRoll}>
                    <button
                      className={styles.passButton}
                      aria-label="Pass and roll dice"
                      onClick={() => dispatch(rollDice())}
                    >
                     End Turn and Roll Dice
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.diceButton}
                    aria-label="Roll Dice"
                    onClick={() => dispatch(rollDice())}
                    disabled={state.winner || state.doublingCube.pendingOffer}
                  >
                    {ROLL_DICE_BUTTON_TEXT}
                  </button>
                )}
              </div>
            )}
          </div>

          {state.player && !state.winner && (
            <div aria-label={`Current player ${state.player}`} >
              <div>
                Current Player <Checker player={state.player} />
              </div>
              {Object.keys(state.potentialMoves || {}).length < 1 &&
                state.diceValue !== null &&
                state.diceValue.length > 0 && (
                  <div className="toggle-player">
                    <p>no moves available move to next player</p>
                    <button
                      className="toggle-button"
                      aria-label="No moves found release move to next player."
                      onClick={() => dispatch(togglePlayerRoll())}
                    >
                      Release Move To Next Player
                    </button>
                  </div>
                )}
            </div>
          )}

          <div>
            <button
              onClick={() => dispatch(undoRoll())}
              disabled={state.player === null || state.pointsHistory.length <= 1 || state.winner}
              aria-label="Undo last move"
            >
              {UNDO_BUTTON_TEXT}
            </button>
            <button
              className="reset-game"
              onClick={() => dispatch(resetGame())}
              disabled={state.player === null || state.winner}
              aria-label="Reset the game"
            >
              {RESET_BUTTON_TEXT}
            </button>
            <button
              onClick={handleSaveGameLink}
              disabled={state.player === null || state.winner}
              aria-label="Save game link"
            >
              Save Game Link
            </button>
          </div>
        </div>

        <div className={styles.backgammonBorneOff}>
          {state.checkersBorneOff[PLAYER_LEFT] > 0 && (
            <div aria-label={`Borne Off for ${PLAYER_LEFT}`}>
              <Checker player={PLAYER_LEFT} /> Borne Off: {state.checkersBorneOff[PLAYER_LEFT]}
            </div>
          )}
          {state.checkersBorneOff[PLAYER_RIGHT] > 0 && (
            <div aria-label={`Borne Off for ${PLAYER_RIGHT}`}>
              <Checker player={PLAYER_RIGHT} /> Borne Off: {state.checkersBorneOff[PLAYER_RIGHT]}
            </div>
          )}
        </div>

        <div className={styles.backgammonBar}>
          {state.checkersOnBar[PLAYER_LEFT] > 0 && (
            <div aria-label={`Checkers Bar for ${PLAYER_LEFT}`}>
              <Checker player={PLAYER_LEFT} /> Bar: {state.checkersOnBar[PLAYER_LEFT]}
            </div>
          )}
          {state.checkersOnBar[PLAYER_RIGHT] > 0 && (
            <div aria-label={`Checkers Bar for ${PLAYER_RIGHT}`}>
              <Checker player={PLAYER_RIGHT} /> Bar: {state.checkersOnBar[PLAYER_RIGHT]}
            </div>
          )}
        </div>

        <div className={styles.backgammonDebug}>
          <div className={styles.debugControls}>
            <TestBoardLoader
              testBoards={testBoards}
              onLoadTestBoard={handleLoadTestBoard}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Backgammon;
