import PropsType from 'prop-types';
import './styles.css';

const StatusBox = ({ isSolved }) => {

  return (
    <div
      aria-label="Game Status"
      className="slide-puzzle-status"
      role="status"
      aria-live="polite"
    >
      {isSolved ? 'Game Won' : 'Game On'}
    </div>
  )
}

StatusBox.propTypes = {
  isSolved: PropsType.bool
}

export default StatusBox;
