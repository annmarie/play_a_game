import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initializeDebugMode } from './slice';
import { useEffect } from 'react';
import { LOAD_TEST_BOARD_LABEL } from './globals';
import PropTypes from 'prop-types';

const TestBoardLoader = ({ testBoards, onLoadTestBoard }) => {
  const dispatch = useDispatch();
  const isDebugMode = useSelector((state) => state.debug.isDebugMode);

  useEffect(() => {
    dispatch(initializeDebugMode());
  }, [dispatch]);

  const handleLoadTestBoard = useCallback((boardKey) => {
    if (boardKey && testBoards[boardKey]) {
      onLoadTestBoard(testBoards[boardKey]);
      const url = new URL(window.location);
      url.searchParams.delete('debug');
      window.history.replaceState({}, '', url);
    }
  }, [testBoards, onLoadTestBoard]);

  if (!isDebugMode) return null;

  return (
    <div>
      <label>{LOAD_TEST_BOARD_LABEL}
        <select aria-label={LOAD_TEST_BOARD_LABEL} onChange={(e) => handleLoadTestBoard(e.target.value)}>
          <option value="">Select...</option>
          {Object.keys(testBoards).map(key => (
            <option key={key} value={key}>{testBoards[key].name || key}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

TestBoardLoader.propTypes = {
  testBoards: PropTypes.objectOf(PropTypes.shape({
    name: PropTypes.string,
  })).isRequired,
  onLoadTestBoard: PropTypes.func.isRequired,
};

export default TestBoardLoader;