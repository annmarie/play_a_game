import PropTypes from 'prop-types';
import { PLAYER_LEFT, PLAYER_RIGHT } from '../globals';
import Checker from './Checker';
import DoublesCube from './DoublesCube';
import styles from '../Backgammon.module.css';

const GameScore = ({ gamesWon, doublingCube, currentPlayer, winner, turnEnding }) => {
  return (
    <div className={styles.gameScore}>
      <div className={styles.gameScoreLeft}>
        <div>Games Won:</div>
        <div className={styles.scoreRow}>
          <div><Checker player={PLAYER_LEFT} /> {gamesWon?.[PLAYER_LEFT] || 0}</div>
          <div><Checker player={PLAYER_RIGHT} /> {gamesWon?.[PLAYER_RIGHT] || 0}</div>
        </div>
      </div>
      <DoublesCube
        doublingCube={doublingCube}
        currentPlayer={currentPlayer}
        winner={winner}
        turnEnding={turnEnding}
      />
    </div>
  );
};

GameScore.propTypes = {
  gamesWon: PropTypes.object,
  doublingCube: PropTypes.object,
  currentPlayer: PropTypes.string,
  winner: PropTypes.string,
  turnEnding: PropTypes.bool
};

export default GameScore;
