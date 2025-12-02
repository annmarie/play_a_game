import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT,
  ROLL_DICE_BUTTON_TEXT, END_TURN_BUTTON_TEXT,
  PLAYER_LEFT, PLAYER_RIGHT
} from './globals';
import {
  makeMove, rollDice, undoRoll, togglePlayerRoll, resetGame,
  playAgain, selectSpot, loadTestBoard, loadFromURL, saveToURL, endTurn,
  acceptDouble, declineDouble, makeMultiplayerMove, syncGameState, setMultiplayerMode
} from './slice';
import { testBoards } from './testBoards';
import { setConnectionStatus, joinRoom, setOpponent, leaveRoom, setError } from '../RoomManager/slice';
import { wsService } from '../services/websocket';
import Dice from './Dice';
import Board from './Board';
import Checker from './Checker';
import DoublesCube from './DoublesCube';
import TestBoardLoader from '../TestBoardLoader';
import RoomManager from '../RoomManager';
import Layout from '../Layout';
import styles from './Backgammon.module.css';

const Backgammon = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.backgammon);
  const multiplayer = useSelector((state) => state.multiplayer);

  useEffect(() => {
    dispatch(loadFromURL());

    wsService.connect();

    const handleConnected = () => {
      dispatch(setConnectionStatus('connected'));
    };

    const handleDisconnected = () => {
      dispatch(setConnectionStatus('disconnected'));
    };

    const handleRoomCreated = (data) => {
      dispatch(joinRoom({ roomId: data.roomId, isHost: true }));
    };

    const handleRoomJoined = (data) => {
      dispatch(joinRoom({ roomId: data.roomId, isHost: false }));
      if (data.opponent) {
        dispatch(setOpponent(data.opponent));
        dispatch(setMultiplayerMode({
          isMultiplayer: true,
          myPlayer: data.isHost ? PLAYER_LEFT : PLAYER_RIGHT
        }));
      }
    };

    const handleOpponentJoined = (data) => {
      dispatch(setOpponent(data.opponent));
      dispatch(setMultiplayerMode({
        isMultiplayer: true,
        myPlayer: PLAYER_LEFT
      }));
    };

    const handleGameMove = (data) => {
      dispatch(makeMultiplayerMove(data));
    };

    const handleGameSync = (data) => {
      dispatch(syncGameState(data.gameState));
    };

    const handleError = (error) => {
      dispatch(setError(error.message || 'Connection error'));
    };

    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('roomCreated', handleRoomCreated);
    wsService.on('roomJoined', handleRoomJoined);
    wsService.on('opponentJoined', handleOpponentJoined);
    wsService.on('gameMove', handleGameMove);
    wsService.on('gameSync', handleGameSync);
    wsService.on('error', handleError);

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('roomCreated', handleRoomCreated);
      wsService.off('roomJoined', handleRoomJoined);
      wsService.off('opponentJoined', handleOpponentJoined);
      wsService.off('gameMove', handleGameMove);
      wsService.off('gameSync', handleGameSync);
      wsService.off('error', handleError);
    };
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        if (state.turnEnding) {
          dispatch(endTurn());
        } else if (state.diceValue === null) {
          dispatch(rollDice());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.diceValue, state.turnEnding, dispatch]);

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

  const handleSaveGameLink = useCallback(() => {
    try {
      dispatch(saveToURL());
      alert('Game link copied to clipboard!');
    } catch (err) {
      console.error('Failed to save game link:', err);
      alert('Failed to copy game link to clipboard.');
    }
  }, [dispatch]);

  const handleLoadTestBoard = useCallback((testBoard) => {
    dispatch(loadTestBoard(testBoard));
  }, [dispatch]);

  const handleLeaveRoom = () => {
    dispatch(leaveRoom());
    dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }));
    wsService.send('leaveRoom', { roomId: multiplayer.roomId });
  };

  return (
    <Layout>
      <div className={styles.backgammonGame}>
        <h2>Backgammon</h2>

        {!multiplayer.roomId && (
          <div className={styles.gameModeSelector}>
            <button
              onClick={() => dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }))}
              className={!state.isMultiplayer ? styles.activeMode : ''}
            >
              Local Game
            </button>
            <RoomManager gameType="backgammon" />
          </div>
        )}

        {multiplayer.roomId && (
          <div className={styles.multiplayerInfo}>
            <p>Room: {multiplayer.roomId}</p>
            <p>You: {multiplayer.playerName} ({state.myPlayer})</p>
            {multiplayer.opponent ? (
              <p>Opponent: {multiplayer.opponent.name} ({state.myPlayer === PLAYER_LEFT ? PLAYER_RIGHT : PLAYER_LEFT})</p>
            ) : (
              <p>Waiting for opponent...</p>
            )}
            <button onClick={handleLeaveRoom}>Leave Room</button>
          </div>
        )}
        <div className={styles.gameScore}>
          <div className={styles.gameScoreLeft}>
            <div>Games Won:</div>
            <div className={styles.scoreRow}>
              <div><Checker player={PLAYER_LEFT} /> {state.gamesWon?.[PLAYER_LEFT] || 0}</div>
              <div><Checker player={PLAYER_RIGHT} /> {state.gamesWon?.[PLAYER_RIGHT] || 0}</div>
            </div>
          </div>
          <DoublesCube
            doublingCube={state.doublingCube}
            currentPlayer={state.player}
            winner={state.winner}
            turnEnding={state.turnEnding}
          />
        </div>

        {state.winner && (
          <div className="winner-announcement">
            🎉 Winner: <Checker player={state.winner} />
            <button
              className={styles.playAgainButton}
              onClick={() => dispatch(playAgain())}
              aria-label="Play another game"
            >
              Play Again
            </button>
          </div>
        )}

        {state.doublingCube.pendingOffer && (
          <div className={styles.doubleOffer}>
            <div className={styles.doubleQuestion}>
              <span>Does</span>
              <Checker player={state.doublingCube.pendingOffer === PLAYER_LEFT ? PLAYER_RIGHT : PLAYER_LEFT} />
              <span>accept the offer?</span>
            </div>
            <div className={styles.doubleButtons}>
              <button
                className={styles.acceptButton}
                onClick={() => dispatch(acceptDouble())}
                aria-label="Accept the double"
              >
                Accept
              </button>
              <button
                className={styles.declineButton}
                onClick={() => dispatch(declineDouble())}
                aria-label="Decline the double"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        <Board
          points={state.points}
          selectedSpot={state.selectedSpot}
          potentialSpots={state.potentialSpots}
          handleSpotClick={handleSpotClick}
          potentialMoves={state.potentialMoves}
        />

        <div className={styles.backgammonStatus}>
          <div>
            {state.diceValue ? (
              <div>
                <Dice diceValue={state.diceValue} />
                {(Object.keys(state.potentialMoves || {}).length < 1 || state.turnEnding) && (
                  <button
                    className="end-turn-button"
                    aria-label="End turn"
                    onClick={() => dispatch(state.turnEnding ? endTurn() : togglePlayerRoll())}
                  >
                    {END_TURN_BUTTON_TEXT}
                  </button>
                )}
              </div>
            ) : (
              <button
                className={styles.diceButton}
                aria-label="Roll Dice"
                onClick={() => dispatch(rollDice())}
                disabled={state.winner || state.doublingCube.pendingOffer || state.turnEnding}
              >
                {ROLL_DICE_BUTTON_TEXT}
              </button>
            )}
            {state.turnEnding && !state.diceValue && (
              <button
                className="end-turn-button"
                aria-label="End turn"
                onClick={() => dispatch(endTurn())}
              >
                {END_TURN_BUTTON_TEXT}
              </button>
            )}
          </div>

          {state.player && !state.winner && (
            <div aria-label={`Current player ${state.player}`}>
              Current Player <Checker player={state.player} />
            </div>
          )}

          <div>
            <button
              onClick={() => dispatch(undoRoll())}
              disabled={!state.player || state.pointsHistory.length <= 1 || state.winner || state.isMultiplayer}
              aria-label="Undo last move"
            >
              {UNDO_BUTTON_TEXT}
            </button>
            <button
              onClick={() => dispatch(resetGame())}
              disabled={!state.player || state.winner || state.isMultiplayer}
              aria-label="Reset the game"
            >
              {RESET_BUTTON_TEXT}
            </button>
            {!multiplayer.roomId && (
              <button
                onClick={handleSaveGameLink}
                disabled={!state.player || state.winner}
                aria-label="Save game link"
              >
                Save Game Link
              </button>
            )}
          </div>
        </div>

        <div className={styles.backgammonBorneOff}>
          {[PLAYER_LEFT, PLAYER_RIGHT].map(player =>
            state.checkersBorneOff[player] > 0 && (
              <div key={player} aria-label={`Borne Off for ${player}`}>
                <Checker player={player} /> Borne Off: {state.checkersBorneOff[player]}
              </div>
            )
          )}
        </div>

        <div className={styles.backgammonBar}>
          {[PLAYER_LEFT, PLAYER_RIGHT].map(player =>
            state.checkersOnBar[player] > 0 && (
              <div key={player} aria-label={`Checkers Bar for ${player}`}>
                <Checker player={player} /> Bar: {state.checkersOnBar[player]}
              </div>
            )
          )}
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
