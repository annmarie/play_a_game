import PropTypes from 'prop-types';
import Point from '../Point'
import './style.css'

const Board = ({ points, selectedSpot, potentialSpots, handleSpotClick }) => {
  return (
    <div className="backgammon-board">
      {points.map((point) => (
        <Point
          key={point.id}
          point={point}
          onClick={handleSpotClick}
          selected={selectedSpot === point.id ? true : false}
          potential={potentialSpots.includes(point.id) ? true : false}
        />
      ))}
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
