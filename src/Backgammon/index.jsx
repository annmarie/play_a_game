import { useReducer, useCallback, useEffect } from 'react';
import { initialState, reducer } from './reducer';
import {
  SELECT_SPOT, MOVE_CHECKER,
  ROLL_DICE, UNDO, RESET
} from './actionTypes';
import {
  UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT,
  ROLL_DICE_BUTTON_TEXT,
  PLAYER_LEFT,
  PLAYER_RIGHT
} from './globals';
import Dice from './Dice';
import Board from './Board';
import Checker from './Checker';
import './styles.css';

const Backgammon = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        if (state.diceValue === null) {
          dispatch({ type: ROLL_DICE });
        }
      }
      if (e.key === 'u') {
        dispatch({ type: UNDO });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.diceValue]);

  const handleSpotClick = useCallback(
    (point) => {
      if (state.selectedSpot) {
        const fromPointId = state.selectedSpot;
        const toPointId = point.id;
        dispatch({ type: MOVE_CHECKER, payload: { fromPointId, toPointId } });
      } else if (point.player === state.player) {
        dispatch({ type: SELECT_SPOT, payload: point.id });
      }
    },
    [state.selectedSpot, state.player]
  );

  return (
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
                onClick={() => dispatch({ type: ROLL_DICE })}
                disabled={false}
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
            {Object.keys(state.potentialMoves).length < 1 && (
                <div className="dice-roll">
                  no moves available move to next roll
                  <button
                    className="dice-button"
                    aria-label="No moves found roll next move"
                    onClick={() => dispatch({ type: ROLL_DICE })}
                    disabled={false}
                  >
                    {ROLL_DICE_BUTTON_TEXT}
                  </button>
                </div>
              )}
          </div>
        )}

        <div>
          <button
            onClick={() => dispatch({ type: UNDO })}
            disabled={state.player === null}
            aria-label="Undo last move"
          >
            {UNDO_BUTTON_TEXT}
          </button>
          <button
            className="reset-game"
            onClick={() => dispatch({ type: RESET })}
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
  );
};

export default Backgammon;
