import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { ROLL_DICE_BUTTON_TEXT, END_TURN_BUTTON_TEXT } from '../globals';
import { rollDice, endTurn, togglePlayerRoll } from '../slice';
import Dice from './Dice';
import styles from '../Backgammon.module.css';

const GameControls = ({ diceValue, potentialMoves, turnEnding, winner, doublingCube }) => {
  const dispatch = useDispatch();

  return (
    <div>
      {diceValue ? (
        <div>
          <Dice diceValue={diceValue} />
          {(Object.keys(potentialMoves || {}).length < 1 || turnEnding) && (
            <button
              className="end-turn-button"
              aria-label="End turn"
              onClick={() => dispatch(turnEnding ? endTurn() : togglePlayerRoll())}
            >
              {END_TURN_BUTTON_TEXT}
            </button>
          )}
        </div>
      ) : (
        <button
          className={styles.diceButton}
          aria-label="Roll Dice"
          onClick={() => dispatch(rollDice())}
          disabled={winner || doublingCube.pendingOffer || turnEnding}
        >
          {ROLL_DICE_BUTTON_TEXT}
        </button>
      )}
      {turnEnding && !diceValue && (
        <button
          className="end-turn-button"
          aria-label="End turn"
          onClick={() => dispatch(endTurn())}
        >
          {END_TURN_BUTTON_TEXT}
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
  })
};

export default GameControls;
