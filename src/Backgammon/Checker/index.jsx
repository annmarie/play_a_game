// Backgammon Checker Component
import PropTypes from 'prop-types'
import { PLAYER_RIGHT, PLAYER_LEFT } from '../globals';
import styles from './Checker.module.css'

const getClassNames = (player, selected) => {
  let playerClass;
  if (player === PLAYER_RIGHT) {
    playerClass = styles.playerRight;
  } else if (player === PLAYER_LEFT) {
    playerClass = styles.playerLeft;
  } else {
    playerClass = styles.playerLeft;
  }
  const selectedClass = selected ? ` ${styles.selected}` : '';
  return `${styles.checker} ${playerClass}${selectedClass}`;
};

const getPlayerId = (player) => {
  if (player === PLAYER_RIGHT) {
    return 'player_right';
  } else if (player === PLAYER_LEFT) {
    return 'player_left';
  } else {
    return 'player_left';
  }
};

const Checker = ({ player, selected = false }) => {
  const classNames = getClassNames(player, selected);
  const playerId = getPlayerId(player);
  return (<div role="checker" className={classNames} id={playerId}></div>);
};

Checker.propTypes = {
  player: PropTypes.string.isRequired,
  selected: PropTypes.bool
};

export default Checker;
