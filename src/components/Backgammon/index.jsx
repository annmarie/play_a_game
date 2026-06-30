import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, selectSpot, setMultiplayerMode, startGame, resetGame } from './slice';
import { useWebSocketHandlers } from './hooks/useWebSocketHandlers';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import Multiplayer from '@/components/Multiplayer';
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
import GameModeSelect from '@/components/GameModeSelect';
import { shouldShowGame } from '@/components/Multiplayer/multiplayerUtils';
import { GAME_TEXT } from './globals';

const Backgammon = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.backgammon);
  const multiplayer = useSelector((state) => state.multiplayer || {});

  useWebSocketHandlers();
  useKeyboardControls(state.diceValue, state.turnEnding);

  const room = multiplayer.rooms?.backgammon;
  const opponent = room?.opponent;
  const isLocal = state.isMultiplayer === false;

  const handlePlayLocal = () => {
    dispatch(setMultiplayerMode({ isMultiplayer: false }));
    dispatch(startGame());
  };

  const handlePlayOnline = () => {
    dispatch(setMultiplayerMode({ isMultiplayer: true }));
  };

  const handleSpotClick = useCallback(
    (point) => {
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

        {state.isMultiplayer === null && (
          <GameModeSelect onLocal={handlePlayLocal} onOnline={handlePlayOnline} />
        )}

        {state.isMultiplayer === true && !opponent && (
          <Multiplayer gameType="backgammon" />
        )}

        {shouldShowGame(state.isMultiplayer, room?.roomId, opponent) && (
          <>
            {state.isMultiplayer && (
              <>
                <RoomStatus
                  roomId={room.roomId}
                  opponent={room.opponent}
                  myPlayer={state.myPlayer}
                  playerName={multiplayer.playerName}
                />

                <StartGame
                  isMultiplayer={state.isMultiplayer}
                  hasOpponent={!!opponent}
                  gameStarted={state.gameStarted}
                />
              </>
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
                disabled={(state.isMultiplayer && !state.isMyTurn) || (state.isMultiplayer && !state.gameStarted)}
              />

              <GameStatus
                player={state.player}
                winner={state.winner}
                pointsHistory={state.pointsHistory}
                isMultiplayer={state.isMultiplayer}
                checkersBorneOff={state.checkersBorneOff}
                checkersOnBar={state.checkersOnBar}
                roomId={multiplayer.rooms?.backgammon?.roomId}
              />
            </div>

            {isLocal && (
              <button
                type="button"
                className={styles.exitButton}
                onClick={() => dispatch(resetGame())}
              >
                Exit to Menu
              </button>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Backgammon;
