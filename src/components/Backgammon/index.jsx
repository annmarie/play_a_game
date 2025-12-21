import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, selectSpot, setMultiplayerMode } from './slice';
import { useWebSocketHandlers } from './handlers/useWebSocketHandlers';
import { useKeyboardControls } from './handlers/useKeyboardControls';
import GameModeSelector from '@/components/ModeSelector';
import MultiplayerInfo from './components/MultiplayerInfo';
import GameScore from './components/GameScore';
import WinnerAnnouncement from './components/WinnerAnnouncement';
import DoubleOffer from './components/DoubleOffer';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';
import Board from './components/Board';
import Layout from '@components/Layout';
import styles from './Backgammon.module.css';

const Backgammon = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.backgammon);
  const multiplayer = useSelector((state) => state.multiplayer);

  useWebSocketHandlers();
  useKeyboardControls(state.diceValue, state.turnEnding);

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

  const showGame = state.isMultiplayer === false || multiplayer.roomId;

  return (
    <Layout showHeader={true}>
      <div className={styles.backgammonGame}>
        <h2>Backgammon</h2>

        {!showGame && (
          <GameModeSelector
            gameType="backgammon"
            isMultiplayer={state.isMultiplayer}
            setMultiplayerMode={setMultiplayerMode}
          />
        )}

        {showGame && (
          <>
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default Backgammon;
