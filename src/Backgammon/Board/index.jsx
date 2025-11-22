import PropTypes from 'prop-types';
import Point from '../Point'
import './styles.css'

const Board = ({ points, selectedSpot, potentialSpots, handleSpotClick }) => {
  return (
    <div className="backgammon-board">
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
