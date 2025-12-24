import PropTypes from 'prop-types';
import styles from './PlayerText.module.css';
import { PLAYER } from '../../globals';

const PlayerText = ({ player, children }) => {
  const playerClass = player === PLAYER.ONE ? styles.playerOne : styles.playerTwo;

  return (
    <span className={playerClass}>
      {children || player}
    </span>
  );
};

PlayerText.propTypes = {
  player: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default PlayerText;
