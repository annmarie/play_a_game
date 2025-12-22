import GameModeSelector from '@/components/ModeSelector';
import { BUTTON_TEXT, PLAYERS } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, playAgain, setMultiplayerMode } from './slice';
import { leaveRoom } from '@components/MultiplayerSetup/slice';
import { wsService } from '@services/websocket';
import { useWebSocketHandlers } from './hooks/useWebSocketHandlers';
import StatusBox from './components/StatusBox';
import Board from './components/Board';
import styles from './Connect4.module.css';
import Layout from '@components/Layout';

const Connect4 = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.connect4);
  const multiplayer = useSelector((state) => state.multiplayer);
  const handleCellClick = (col) => dispatch(makeMove({ col }));

  useWebSocketHandlers();

  const handleLeaveRoom = () => {
    dispatch(leaveRoom());
    dispatch(setMultiplayerMode({ isMultiplayer: null, myPlayer: null }));
    wsService.send('leaveRoom', { roomId: multiplayer.roomId });
  };

  const showGame = state.isMultiplayer === false || multiplayer.roomId;

  return (
    <Layout showHeader={true}>
      <div className={styles.connect4Game}>
        <h3 className={styles.connect4Title}>Connect Four</h3>

        {!showGame && (
          <GameModeSelector
            gameType="connect4"
            isMultiplayer={state.isMultiplayer}
            setMultiplayerMode={setMultiplayerMode}
          />
        )}

        {showGame && (
          <>
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
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Connect4;
