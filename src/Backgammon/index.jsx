import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT,
  ROLL_DICE_BUTTON_TEXT,
  PLAYER_LEFT, PLAYER_RIGHT
} from './globals';
import { makeMove, rollDice, undoRoll, togglePlayerRoll, resetGame, selectSpot, loadTestBoard, loadFromURL, saveToURL } from './slice';
import Dice from './Dice';
import Board from './Board';
import Checker from './Checker';
import './layout.css';
import { useDispatch } from 'react-redux';
import { testBoards } from './testBoards';
import Layout from '../Layout';

const Backgammon = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.backgammon);

  const isDebugMode = new URLSearchParams(window.location.search).has('debug');

  useEffect(() => {
    dispatch(loadFromURL());

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

  const handleSaveGameLink = useCallback(() => {
    dispatch(saveToURL());
    alert('Game link copied to clipboard!');
  }, [dispatch]);

  const handleLoadTestBoard = useCallback((boardKey) => {
    if (boardKey) {
      dispatch(loadTestBoard(testBoards[boardKey]));
      const url = new URL(window.location);
      url.searchParams.delete('debug');
      window.history.replaceState({}, '', url);
    }
  }, [dispatch]);

  return (
    <Layout>
      <div className="backgammon-game">

        <Board
          points={state.points}
          selectedSpot={state.selectedSpot}
          potentialSpots={state.potentialSpots}
          handleSpotClick={handleSpotClick}
        />

        <div className="backgammon-status">
          {state.winner && (
            <div className="winner-announcement">
              🎉 Winner: <Checker player={state.winner} />
            </div>
          )}

          <div>
            {state.diceValue ? (
              <Dice diceValue={state.diceValue} />
            ) : (
              <div className="dice-roll">
                <button
                  className="dice-button"
                  aria-label="Roll Dice"
                  onClick={() => dispatch(rollDice())}
                  disabled={state.winner}
                >
                  {ROLL_DICE_BUTTON_TEXT}
                </button>
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

        <div className="backgammon-borne-off">
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

        <div className="backgammon-bar">
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

        <div className="backgammon-debug">
          {isDebugMode && (
            <div className="debug-controls">
              <label>Load Test Board:
                <select onChange={(e) => handleLoadTestBoard(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="bearOffTest">Bear Off Test</option>
                  <option value="endGame">End Game</option>
                  <option value="undoTest">Undo Test</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Backgammon;
