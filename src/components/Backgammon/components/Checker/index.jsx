// Backgammon Checker Componen
import PropTypes from 'prop-types'
import { PLAYER } from '../../globals';
import styles from './Checker.module.css'

const getClassNames = (player, selected) => {
  const playerClass = player === PLAYER.RIGHT ? styles.playerRight : styles.playerLeft;
  const selectedClass = selected ? ` ${styles.selected}` : '';
  return `${styles.checker} ${playerClass}${selectedClass}`;
};

const getPlayerId = (player) => {
  return player === PLAYER.RIGHT ? 'player_right' : 'player_left';
};

const Checker = ({ player, selected = false }) => {
  if (!player) return null;

  const classNames = getClassNames(player, selected);
  const playerId = getPlayerId(player);
  return (<div role="checker" className={classNames} id={playerId}></div>);
};

Checker.propTypes = {
  player: PropTypes.string.isRequired,
  selected: PropTypes.bool
};

export default Checker;
