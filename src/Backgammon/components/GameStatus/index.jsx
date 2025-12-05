import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT, PLAYER_LEFT, PLAYER_RIGHT } from '../../globals';
import { undoRoll, resetGame } from '../../slice';
import Checker from '../Checker';
import styles from './GameStatus.module.css';

const GameStatus = ({
  player,
  winner,
  pointsHistory,
  isMultiplayer,
  checkersBorneOff,
  checkersOnBar,
  roomId
}) => {
  const dispatch = useDispatch();

  return (
    <div className={styles.gameStatus}>
      {player && !winner && (
        <div className={styles.currentPlayer} aria-label={`Current player ${player}`}>
          Current Player <Checker player={player} />
        </div>
      )}

      <div className={styles.gameButtons}>
        <button
          className={styles.actionButton}
          onClick={() => dispatch(undoRoll())}
          disabled={!player || pointsHistory.length <= 1 || winner || isMultiplayer}
          aria-label="Undo last move"
        >
          {UNDO_BUTTON_TEXT}
        </button>
        {!roomId && <button
          className={styles.actionButton}
          onClick={() => dispatch(resetGame())}
          disabled={!player || winner || isMultiplayer}
          aria-label="Reset the game"
        >
          {RESET_BUTTON_TEXT}
        </button>}
      </div>

      <div className={styles.borneOff}>
        {[PLAYER_LEFT, PLAYER_RIGHT].map(player =>
          checkersBorneOff[player] > 0 && (
            <div key={player} className={styles.statusItem} aria-label={`Borne Off for ${player}`}>
              <Checker player={player} /> Borne Off: {checkersBorneOff[player]}
            </div>
          )
        )}
      </div>

      <div className={styles.bar}>
        {[PLAYER_LEFT, PLAYER_RIGHT].map(player =>
          checkersOnBar[player] > 0 && (
            <div key={player} className={styles.statusItem} aria-label={`Checkers Bar for ${player}`}>
              <Checker player={player} /> Bar: {checkersOnBar[player]}
            </div>
          )
        )}
      </div>
    </div>
  );
};

GameStatus.propTypes = {
  player: PropTypes.string,
  winner: PropTypes.string,
  pointsHistory: PropTypes.array,
  isMultiplayer: PropTypes.bool,
  checkersBorneOff: PropTypes.object,
  checkersOnBar: PropTypes.object,
  roomId: PropTypes.string
};

export default GameStatus;
