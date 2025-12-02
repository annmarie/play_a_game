import { useCallback, useEffect } from 'react';
import { UNDO_BUTTON_TEXT, RESET_BUTTON_TEXT, PLAYER_ONE, PLAYER_TWO } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, makeMultiplayerMove, undoMove, resetGame, playAgain, loadTestBoard, loadFromURL, saveToURL, syncGameState, setMultiplayerMode } from './slice';
import { setConnectionStatus, joinRoom, setOpponent, leaveRoom, setError } from '../RoomManager/slice';
import { wsService } from '../services/websocket';
import StatusBox from './StatusBox';
import Board from './Board';
import styles from './Connect4.module.css';
import Layout from '../Layout';
import TestBoardLoader from '../TestBoardLoader';
import RoomManager from '../RoomManager';
import { testBoards } from './testBoards';

const Connect4 = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.connect4);
  const multiplayer = useSelector((state) => state.multiplayer);
  const handleCellClick = (col) => dispatch(makeMove({ col }));

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
          myPlayer: data.isHost ? PLAYER_ONE : PLAYER_TWO
        }));
      }
    };

    const handleOpponentJoined = (data) => {
      dispatch(setOpponent(data.opponent));
      dispatch(setMultiplayerMode({
        isMultiplayer: true,
        myPlayer: PLAYER_ONE
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

  const handleSaveGameLink = useCallback(() => {
    try {
      dispatch(saveToURL());
      alert('Game link copied to clipboard!');
    } catch (error) {
      alert('Failed to save game link. Please try again.');
      console.error('Error saving game link:', error);
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
      <div className={styles.connect4Game}>
        <h2 className={styles.connect4Title}>Connect Four</h2>

        {!multiplayer.roomId && (
          <div className={styles.gameModeSelector}>
            <button
              onClick={() => dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }))}
              className={!state.isMultiplayer ? styles.activeMode : ''}
            >
              Local Game
            </button>
            <RoomManager gameType="connect4" />
          </div>
        )}

        {multiplayer.roomId && (
          <div className={styles.multiplayerInfo}>
            <p>Room: {multiplayer.roomId}</p>
            <p>You: {multiplayer.playerName} ({state.myPlayer})</p>
            {multiplayer.opponent ? (
              <p>Opponent: {multiplayer.opponent.name} ({state.myPlayer === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE})</p>
            ) : (
              <p>Waiting for opponent...</p>
            )}
            <button onClick={handleLeaveRoom}>Leave Room</button>
          </div>
        )}

        <div className={styles.gameScore}>
          <div>Games Won:</div>
          <div style={{color: 'red'}}>{PLAYER_ONE}: {state.gamesWon?.[PLAYER_ONE] || 0}</div>
          <div style={{color: 'yellow'}}>{PLAYER_TWO}: {state.gamesWon?.[PLAYER_TWO] || 0}</div>
        </div>

        <StatusBox
          player={state.player}
          winner={state.winner}
          winnerDesc={state.winnerDesc}
          boardFull={state.boardFull}
          onPlayAgain={() => dispatch(playAgain())}
          isMultiplayer={state.isMultiplayer}
          isMyTurn={state.isMyTurn}
          myPlayer={state.myPlayer}
        />

        <Board
          board={state.board}
          handleCellClick={handleCellClick}
          disabled={state.isMultiplayer && !state.isMyTurn}
        />

        <div className={styles.connect4Actions}>
          <button
            aria-label="Undo Move"
            onClick={() => dispatch(undoMove())}
            disabled={state.history.length <= 1 || state.winner || state.isMultiplayer}
          >
            {UNDO_BUTTON_TEXT}
          </button>
          <button
            aria-label="Reset Game"
            onClick={() => dispatch(resetGame())}
            disabled={state.history.length === 0 || state.isMultiplayer}
          >
            {RESET_BUTTON_TEXT}
          </button>
          {!state.isMultiplayer && (
            <button
              onClick={handleSaveGameLink}
              disabled={state.history.length === 0 || state.winner}
              aria-label="Save game link"
            >
              Save Game Link
            </button>
          )}
        </div>

        {!state.isMultiplayer && (
          <div className={styles.connect4Debug}>
            <TestBoardLoader
              testBoards={testBoards}
              onLoadTestBoard={handleLoadTestBoard}
            />
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Connect4;
