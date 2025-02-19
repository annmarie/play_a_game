import PropTypes from 'prop-types'
import Checker from '../Checker'
import './styles.css'

const Point = ({ point, onClick, selected }) => {
  const getPointClass = (id) => {
    const colorClass = id % 2 === 0 ? 'light' : 'dark';
    const placeClass = id > 12 ? 'bottom' : 'top';
    const selectedClass = selected ? 'selected' : '';
    return `${colorClass} ${placeClass} ${selectedClass}`;
  };

  return (
    <div
      key={point.id}
      role="point"
      data-key={point.id}
      className={`point ${getPointClass(point.id)}`}
      onClick={() => onClick(point)}
      aria-label={`Point ${point.id} with ${point.checkers} checkers`}
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
  selected: PropTypes.bool
};

export default Point
