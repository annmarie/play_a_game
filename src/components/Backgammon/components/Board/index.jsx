// backgammon board
import PropTypes from 'prop-types';
import Point from '../Point'
import styles from './Board.module.css'

const Board = ({ points, selectedSpot, potentialSpots, handleSpotClick }) => {
  const handleBearOffClick = () => {
    if (handleSpotClick) {
      handleSpotClick({ id: -1 });
    }
  };

  return (
    <div className={styles.backgammonBoard}>
      {points.map((point) => {
        const isSelected = selectedSpot === point.id;
        const isPotential = potentialSpots.includes(point.id);

        return (
          <Point
            key={point.id}
            point={point}
            onClick={handleSpotClick}
            selected={isSelected}
            potential={isPotential}
          />
        );
      })}
      {potentialSpots.includes(-1) && (
        <div
          className={styles.bearOffArea}
          onClick={handleBearOffClick}
        >
          Bear Off
        </div>
      )}
    </div>
  );
};

Board.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      player: PropTypes.string,
      checkers: PropTypes.number.isRequired,
    })
  ).isRequired,
  selectedSpot: PropTypes.number,
  potentialSpots: PropTypes.arrayOf(PropTypes.number).isRequired,
  handleSpotClick: PropTypes.func.isRequired,
};

export default Board;
