import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeMultiplayerMove, syncGameState, setMultiplayerMode } from '../slice';
import { setConnectionStatus, joinRoom, setOpponent, setError } from '../../RoomManager/slice';
import { wsService } from '../../services/websocket';
import { PLAYERS } from '../globals';

export const useWebSocketHandlers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
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
          myPlayer: data.isHost ? PLAYERS.ONE : PLAYERS.TWO
        }));
      }
    };

    const handleOpponentJoined = (data) => {
      dispatch(setOpponent(data.opponent));
      dispatch(setMultiplayerMode({
        isMultiplayer: true,
        myPlayer: PLAYERS.ONE
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
};
