import { RESET_BUTTON_TEXT } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { moveTile, resetGame } from './slice';
import StatusBox from './StatusBox';
import Board from './Board';
import Header from '../Header';
import './styles.css';

const SidePuzzle = () => {
  const dispatch = useDispatch();
  const handleTileClick = (row, col) => dispatch(moveTile({ row, col }));
  const state = useSelector((state) => state.slidepuzzle);

  return (
    <div className="main">
      <Header />
      <div className="slide-puzzle-game">

        <h3 className="slide-puzzle-title">Slide Puzzle</h3>

        <StatusBox isSolved={state.isSolved} />

        <Board tiles={state.tiles} onTileClick={handleTileClick} />

        <button
          aria-label="Reset the game to its initial state"
          data-testid="reset-button"
          onClick={() => dispatch(resetGame())}
        >
          {RESET_BUTTON_TEXT}
        </button>

      </div>
    </div>
  );
};

export default SidePuzzle;
