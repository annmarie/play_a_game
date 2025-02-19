import PropTypes from 'prop-types'
import { PLAYER_RIGHT, PLAYER_LEFT } from '../globals';
import './styles.css'

const Checker = ({ player, selected }) => {
  const className = `checker ${
    player === PLAYER_RIGHT
      ? 'player_right'
      : player === PLAYER_LEFT
        ? 'player_left'
        : ''
    } ${selected ? 'selected' : ''}`
  return (<div data-testid="checker" className={className}></div>)
};

Checker.propTypes = {
  player: PropTypes.string.isRequired,
  selected: PropTypes.bool
};

export default Checker;
