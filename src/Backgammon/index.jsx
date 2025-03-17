import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT,
  ROLL_DICE_BUTTON_TEXT,
  PLAYER_LEFT, PLAYER_RIGHT
} from './globals';
import { makeMove, rollDice, undoRoll, togglePlayerRoll, resetGame, selectSpot } from './slice';
import Dice from './Dice';
import Board from './Board';
import Checker from './Checker';
import './styles.css';
import { useDispatch } from 'react-redux';
import Header from '../Header';

const Backgammon = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.backgammon);

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

  return (
    <div className="main">
      <Header />
      <div className="backgammon-game">

        <Board
          points={state.points}
          selectedSpot={state.selectedSpot}
          potentialSpots={state.potentialSpots}
          handleSpotClick={handleSpotClick}
        />

        <div className="backgammon-status">
          <div>

            {state.diceValue ? (
              <Dice diceValue={state.diceValue} />
            ) : (
              <div className="dice-roll">
                <button
                  className="dice-button"
                  aria-label="Roll Dice"
                  onClick={() => dispatch(rollDice())}
                >
                  {ROLL_DICE_BUTTON_TEXT}
                </button>
              </div>
            )}
          </div>

          {state.player && (
            <div aria-label={`Current player ${state.player}`} >
              <div>
                Current Player <Checker player={state.player} />
              </div>
              {Object.keys(state.potentialMoves).length < 1 &&
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
              disabled={state.player === null}
              aria-label="Undo last move"
            >
              {UNDO_BUTTON_TEXT}
            </button>
            <button
              className="reset-game"
              onClick={() => dispatch(resetGame())}
              disabled={state.player === null}
              aria-label="Reset the game"
            >
              {RESET_BUTTON_TEXT}
            </button>
          </div>
        </div>
        <div className="backgammon-bar">
          <div>
            {state.checkersOnBar[PLAYER_LEFT] > 0 && (
              <div aria-label={`Checkers Bar for ${PLAYER_LEFT}`} >
                {state.checkersOnBar[PLAYER_LEFT]} <Checker player={PLAYER_LEFT} />
              </div>
            )}
          </div>
          <div>
            {state.checkersOnBar[PLAYER_RIGHT] > 0 && (
              <div aria-label={`Checkers Bar for ${PLAYER_RIGHT}`} >
                {state.checkersOnBar[PLAYER_RIGHT]} <Checker player={PLAYER_RIGHT} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backgammon;
