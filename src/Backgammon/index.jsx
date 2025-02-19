import { useReducer, useCallback, useEffect } from 'react';
import { initialState, reducer } from './reducer';
import {
  SELECT_SPOT, MOVE_CHECKER,
  ROLL_DICE, UNDO, RESET
} from './actionTypes';
import Dice from './Dice';
import Board from './Board';
import Checker from './Checker';
import './styles.css';

const Backgammon = () => {
  // State management using useReducer
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
                Roll Dice
              </button>
            </div>
          )}
        </div>

        {state.player && (
          <div aria-label={`Current player ${state.player}`} >
            Current Player <Checker player={state.player} />
          </div>
        )}

        <div>
          <button
            onClick={() => dispatch({ type: UNDO })}
            disabled={state.player === null}
            aria-label="Undo last move"
          >
            Undo
          </button>
          <button
            className="reset-game"
            onClick={() => dispatch({ type: RESET })}
            disabled={state.player === null}
            aria-label="Reset the game"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Backgammon;
