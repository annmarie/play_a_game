import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { BUTTON_TEXT } from '../../globals';
import { rollDice, endTurn, togglePlayerRoll } from '../../slice';
import Dice from '../Dice';
import styles from './GameControls.module.css';

const GameControls = ({ diceValue, potentialMoves, turnEnding, winner, doublingCube }) => {
  const dispatch = useDispatch();

  return (
    <div className={styles.gameControls}>
      {diceValue ? (
        <div>
          <Dice diceValue={diceValue} />
          {(Object.keys(potentialMoves || {}).length < 1 || turnEnding) && (
            <button
              className={styles.endTurnButton}
              aria-label="End turn"
              onClick={() => dispatch(turnEnding ? endTurn() : togglePlayerRoll())}
            >
              {BUTTON_TEXT.END_TURN}
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
          {BUTTON_TEXT.ROLL_DICE}
        </button>
      )}
      {turnEnding && !diceValue && (
        <button
          className={styles.endTurnButton}
          aria-label="End turn"
          onClick={() => dispatch(endTurn())}
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
  })
};

export default GameControls;
