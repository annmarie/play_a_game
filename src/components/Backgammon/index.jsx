import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, selectSpot, setMultiplayerMode, startGame } from './slice';
import { useWebSocketHandlers } from './hooks/useWebSocketHandlers';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import GameModeSelector from '@/components/ModeSelector';
import GameScore from './components/GameScore';
import WinnerAnnouncement from './components/WinnerAnnouncement';
import DoubleOffer from './components/DoubleOffer';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';
import Board from './components/Board';
import Layout from '@/components/Layout';
import styles from './Backgammon.module.css';
import Checker from './components/Checker';
import { PLAYER } from './globals';

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

  const showGame = state.isMultiplayer === false || (multiplayer.rooms.backgammon?.roomId && multiplayer.rooms.backgammon?.opponent);
  const showMultiplayerSetup = state.isMultiplayer === null || (state.isMultiplayer === true && !multiplayer.rooms.backgammon?.opponent);

  return (
    <Layout showHeader={true}>
      <div className={styles.backgammonGame}>
        <h3 className={styles.backgammonTitle}>Backgammon</h3>

        {showMultiplayerSetup && (
          <GameModeSelector
            gameType="backgammon"
            isMultiplayer={null}
            setMultiplayerMode={setMultiplayerMode}
          />
        )}

        {showGame && (
          <>
            {state.isMultiplayer && multiplayer.rooms.backgammon?.roomId && (
              <div className={styles.multiplayerInfo}>
                <span>Room: {multiplayer.rooms.backgammon.roomId}</span>
                {multiplayer.rooms.backgammon.opponent && (
                  <div className={styles.playerNames}>
                    <span>
                      {state.myPlayer === PLAYER.LEFT ? multiplayer.playerName || 'You' : (multiplayer.rooms.backgammon.opponent?.name || 'Opponent')} <Checker player={PLAYER.LEFT} />
                    </span>
                    <span>
                      {state.myPlayer === PLAYER.RIGHT ? multiplayer.playerName || 'You' : (multiplayer.rooms.backgammon.opponent?.name || 'Opponent')} <Checker player={PLAYER.RIGHT} />
                    </span>
                  </div>
                )}
              </div>
            )}

            {state.isMultiplayer && multiplayer.rooms.backgammon?.opponent && !state.gameStarted && (
              <div className={styles.startGameSection}>
                <button
                  onClick={() => dispatch(startGame())}
                  className={styles.startGameButton}
                >
                  Roll Dice to Start Game
                </button>
                <p className={styles.startGameText}>First roll determines who goes first</p>
              </div>
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
