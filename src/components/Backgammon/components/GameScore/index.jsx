import PropTypes from 'prop-types';
import { PLAYER } from '../../globals';
import Checker from '../Checker';
import DoublesCube from '../DoublesCube';
import styles from './GameScore.module.css';

const GameScore = ({ gamesWon, doublingCube, currentPlayer, winner, turnEnding }) => {
  return (
    <div className={styles.gameScore}>
      <div className={styles.gameScoreLeft}>
        <div>Games Won:</div>
        <div className={styles.scoreRow}>
          <div className={styles.playerScore}><Checker player={PLAYER.LEFT} /> {gamesWon?.[PLAYER.LEFT] || 0}</div>
          <div className={styles.playerScore}><Checker player={PLAYER.RIGHT} /> {gamesWon?.[PLAYER.RIGHT] || 0}</div>
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
