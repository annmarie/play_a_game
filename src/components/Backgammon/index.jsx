import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, selectSpot, setMultiplayerMode } from './slice';
import { useWebSocketHandlers } from './hooks/useWebSocketHandlers';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import ModeSelector from '@/components/ModeSelector';
import GameScore from './components/GameScore';
import WinnerAnnouncement from './components/WinnerAnnouncement';
import DoubleOffer from './components/DoubleOffer';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';
import Board from './components/Board';
import Layout from '@/components/Layout';
import styles from './Backgammon.module.css';
import RoomStatus from './components/RoomStatus';
import StartGame from './components/StartGame';
import { shouldShowGame, shouldShowMultiplayerSetup } from '@/components/Multiplayer/multiplayerUtils';
import { GAME_TEXT } from './globals';

const Backgammon = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.backgammon);
  const multiplayer = useSelector((state) => state.multiplayer);

  useWebSocketHandlers();
  useKeyboardControls(state.diceValue, state.turnEnding);

  const handleSpotClick = useCallback(
    (point) => {
      // Prevent moves if it's multiplayer and not the player's turn
      if (state.isMultiplayer && !state.isMyTurn) {
        return;
      }

      if (state.selectedSpot) {
        const fromPointId = state.selectedSpot;
        const toPointId = point.id;
        dispatch(makeMove({ fromPointId, toPointId }));
      }
      dispatch(selectSpot(point.id));
    },
    [state.selectedSpot, state.isMultiplayer, state.isMyTurn, dispatch]
  );

  return (
    <Layout showHeader={true}>
      <div className={styles.backgammonGame}>
        <h3 className={styles.backgammonTitle}>{GAME_TEXT.TITLE}</h3>

        {shouldShowMultiplayerSetup(state.isMultiplayer, multiplayer.rooms.backgammon?.opponent) && (
          <ModeSelector
            gameType="backgammon"
            isMultiplayer={null}
            setMultiplayerMode={setMultiplayerMode}
          />
        )}

        {shouldShowGame(state.isMultiplayer, multiplayer.rooms.backgammon?.roomId, multiplayer.rooms.backgammon?.opponent) && (
          <>
            {state.isMultiplayer && multiplayer.rooms.backgammon?.roomId && (
              <RoomStatus
                roomId={multiplayer.rooms.backgammon.roomId}
                opponent={multiplayer.rooms.backgammon.opponent}
                myPlayer={state.myPlayer}
                playerName={multiplayer.playerName}
              />
            )}

            <StartGame
              isMultiplayer={state.isMultiplayer}
              hasOpponent={!!multiplayer.rooms.backgammon?.opponent}
              gameStarted={state.gameStarted}
            />

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
                disabled={(state.isMultiplayer && !state.isMyTurn) || (state.isMultiplayer && !state.gameStarted)}
              />

              <GameStatus
                player={state.player}
                winner={state.winner}
                pointsHistory={state.pointsHistory}
                isMultiplayer={state.isMultiplayer}
                checkersBorneOff={state.checkersBorneOff}
                checkersOnBar={state.checkersOnBar}
                roomId={multiplayer.rooms.backgammon?.roomId}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Backgammon;
