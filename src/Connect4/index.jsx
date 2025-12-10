import { BUTTON_TEXT, PLAYERS } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, resetGame, playAgain, setMultiplayerMode } from './slice';
import { leaveRoom } from '../MultiplayerSetup/slice';
import { wsService } from '../services/websocket';
import { useWebSocketHandlers } from './handlers/useWebSocketHandlers';
import StatusBox from './components/StatusBox';
import Board from './components/Board';
import styles from './Connect4.module.css';
import Layout from '../Layout';
import MultiplayerSetup from '../MultiplayerSetup';

const Connect4 = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.connect4);
  const multiplayer = useSelector((state) => state.multiplayer);
  const handleCellClick = (col) => dispatch(makeMove({ col }));

  useWebSocketHandlers();

  const handleLeaveRoom = () => {
    dispatch(leaveRoom());
    dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }));
    wsService.send('leaveRoom', { roomId: multiplayer.roomId });
  };

  return (
    <Layout showHeader={false}>
      <div className={styles.connect4Game}>
        <h2 className={styles.connect4Title}>Connect Four</h2>

        {!multiplayer.roomId && (
          <div className={styles.gameModeSelector}>
            <button
              onClick={() => dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }))}
              style={{ backgroundColor: '#6c757d', color: 'white' }}
            >
              Local Game
            </button>
            {!state.isMultiplayer && (
              <button
                onClick={() => dispatch(setMultiplayerMode({ isMultiplayer: true, myPlayer: null }))}
                style={{ backgroundColor: '#6c757d', color: 'white' }}
              >
                Multiplayer Game
              </button>
            )}
            {state.isMultiplayer && <MultiplayerSetup gameType="connect4" />}
          </div>
        )}

        {multiplayer.roomId && (
          <div className={styles.multiplayerInfo}>
            <p>Room: {multiplayer.roomId}</p>
            <p>You: {multiplayer.playerName} ({state.myPlayer})</p>
            {multiplayer.opponent ? (
              <p>Opponent: {multiplayer.opponent.name} ({state.myPlayer === PLAYERS.ONE ? PLAYERS.TWO : PLAYERS.ONE})</p>
            ) : (
              <p>Waiting for opponent...</p>
            )}
            <button onClick={handleLeaveRoom}>Leave Room</button>
          </div>
        )}

        <div className={styles.gameScore}>
          <div>Games Won:</div>
          <div style={{ color: 'red' }}>{PLAYERS.ONE}: {state.gamesWon?.[PLAYERS.ONE] || 0}</div>
          <div style={{ color: 'yellow' }}>{PLAYERS.TWO}: {state.gamesWon?.[PLAYERS.TWO] || 0}</div>
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
            {BUTTON_TEXT.UNDO}
          </button>
          {!state.isMultiplayer && (
            <button
              aria-label="Reset Game"
              onClick={() => dispatch(resetGame())}
              disabled={state.history.length === 0}
            >
              {BUTTON_TEXT.RESET}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Connect4;
