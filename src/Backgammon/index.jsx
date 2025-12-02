import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, selectSpot, loadFromURL, loadTestBoard } from './slice';
import { testBoards } from './testBoards';
import { useWebSocketHandlers } from './useWebSocketHandlers';
import { useKeyboardControls } from './useKeyboardControls';
import GameModeSelector from './components/GameModeSelector';
import MultiplayerInfo from './components/MultiplayerInfo';
import GameScore from './components/GameScore';
import WinnerAnnouncement from './components/WinnerAnnouncement';
import DoubleOffer from './components/DoubleOffer';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';
import Board from './components/Board';
import TestBoardLoader from '../TestBoardLoader';
import Layout from '../Layout';
import styles from './Backgammon.module.css';

const Backgammon = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.backgammon);
  const multiplayer = useSelector((state) => state.multiplayer);

  useWebSocketHandlers();
  useKeyboardControls(state.diceValue, state.turnEnding);

  useEffect(() => {
    dispatch(loadFromURL());
  }, [dispatch]);

  const handleSpotClick = useCallback(
    (point) => {
      if (state.selectedSpot) {
        const fromPointId = state.selectedSpot;
        const toPointId = point.id;
        dispatch(makeMove({ fromPointId, toPointId }));
      }
      dispatch(selectSpot(point.id));
    },
    [state.selectedSpot, dispatch]
  );

  const handleLoadTestBoard = useCallback((testBoard) => {
    dispatch(loadTestBoard(testBoard));
  }, [dispatch]);

  return (
    <Layout>
      <div className={styles.backgammonGame}>
        <h2>Backgammon</h2>

        {!multiplayer.roomId && (
          <GameModeSelector isMultiplayer={state.isMultiplayer} />
        )}

        {multiplayer.roomId && (
          <MultiplayerInfo multiplayer={multiplayer} myPlayer={state.myPlayer} />
        )}

        <GameScore
          gamesWon={state.gamesWon}
          doublingCube={state.doublingCube}
          currentPlayer={state.player}
          winner={state.winner}
          turnEnding={state.turnEnding}
        />

        {state.winner && <WinnerAnnouncement winner={state.winner} />}

        {state.doublingCube.pendingOffer && (
          <DoubleOffer pendingOffer={state.doublingCube.pendingOffer} />
        )}

        <Board
          points={state.points}
          selectedSpot={state.selectedSpot}
          potentialSpots={state.potentialSpots}
          handleSpotClick={handleSpotClick}
          potentialMoves={state.potentialMoves}
        />

        <div className={styles.backgammonStatus}>
          <GameControls
            diceValue={state.diceValue}
            potentialMoves={state.potentialMoves}
            turnEnding={state.turnEnding}
            winner={state.winner}
            doublingCube={state.doublingCube}
          />

          <GameStatus
            player={state.player}
            winner={state.winner}
            pointsHistory={state.pointsHistory}
            isMultiplayer={state.isMultiplayer}
            checkersBorneOff={state.checkersBorneOff}
            checkersOnBar={state.checkersOnBar}
            roomId={multiplayer.roomId}
          />
        </div>

        {!state.isMultiplayer && (
          <TestBoardLoader
            testBoards={testBoards}
            onLoadTestBoard={handleLoadTestBoard}
          />
        )}
      </div>
    </Layout>
  );
};

export default Backgammon;
