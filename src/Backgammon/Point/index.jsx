import PropTypes from 'prop-types'
import Checker from '../Checker'
import './styles.css'
import { START_KEY_LEFT } from '../globals';

const Point = ({ point, onClick, selected, potential }) => {
  const getPointClass = (id) => {
    const colorClass = id % 2 === 0 ? 'light' : 'dark';
    const placeClass = id > START_KEY_LEFT ? 'bottom' : 'top';
    const selectedClass = selected ? 'selected' : '';
    const potentialClass = potential ? 'potential' : '';

    return `${colorClass} ${placeClass} ${selectedClass} ${potentialClass}`;
  };

  return (
    <div
      key={point.id}
      role="point"
      data-key={point.id}
      className={`point ${getPointClass(point.id)}`}
      onClick={() => onClick(point)}
      data-testid={`point-${point.id}`}
      aria-label={`Point ${point.id} with ${point.checkers} ${point.player ? point.player + ' ': ''}checkers`}
    >
      {Array.from({ length: point.checkers }).map((_, i) => (
        <Checker key={i} player={point.player} />
      ))}
    </div>
  );
};

Point.propTypes = {
  point: PropTypes.shape({
    id: PropTypes.number.isRequired,
    checkers: PropTypes.number,
    player: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  potential: PropTypes.bool
};

export default Point;
