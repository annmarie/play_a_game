import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { BUTTON_TEXT, ARIA_LABELS } from '../../globals';
import { rollDice, endTurn, togglePlayerRoll } from '../../slice';
import Dice from './Dice';
import styles from './GameControls.module.css';

const GameControls = ({ diceValue, potentialMoves, turnEnding, winner, doublingCube, disabled = false }) => {
  const dispatch = useDispatch();

  return (
    <div className={styles.gameControls}>
      {diceValue ? (
        <div>
          <Dice diceValue={diceValue} />
          {(Object.keys(potentialMoves || {}).length < 1 || turnEnding) && (
            <button
              className={styles.endTurnButton}
              aria-label={ARIA_LABELS.END_TURN}
              onClick={() => dispatch(turnEnding ? endTurn() : togglePlayerRoll())}
              disabled={disabled}
            >
              {BUTTON_TEXT.END_TURN}
            </button>
          )}
        </div>
      ) : (
        <button
          className={styles.diceButton}
          aria-label={ARIA_LABELS.ROLL_DICE}
          onClick={() => dispatch(rollDice())}
          disabled={disabled || winner || doublingCube.pendingOffer || turnEnding}
        >
          {BUTTON_TEXT.ROLL_DICE}
        </button>
      )}
      {turnEnding && !diceValue && (
        <button
          className={styles.endTurnButton}
          aria-label={ARIA_LABELS.END_TURN}
          onClick={() => dispatch(endTurn())}
          disabled={disabled}
        >
          {BUTTON_TEXT.END_TURN}
        </button>
      )}
    </div>
  );
};

GameControls.propTypes = {
  diceValue: PropTypes.array,
  potentialMoves: PropTypes.object,
  turnEnding: PropTypes.bool,
  winner: PropTypes.string,
  doublingCube: PropTypes.shape({
    pendingOffer: PropTypes.string
  }),
  disabled: PropTypes.bool
};

export default GameControls;
