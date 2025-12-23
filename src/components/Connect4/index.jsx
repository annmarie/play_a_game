import GameModeSelector from '@/components/ModeSelector';
import { BUTTON_TEXT, PLAYERS } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, playAgain, setMultiplayerMode } from './slice';
import { useWebSocketHandlers } from './hooks/useWebSocketHandlers';
import StatusBox from './components/StatusBox';
import Board from './components/Board';
import PlayerText from './components/PlayerText';
import styles from './Connect4.module.css';
import Layout from '@/components/Layout';

const Connect4 = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.connect4);
  const multiplayer = useSelector((state) => state.multiplayer);
  const handleCellClick = (col) => dispatch(makeMove({ col }));

  useWebSocketHandlers();

  const showGame = state.isMultiplayer === false || (multiplayer.roomId && multiplayer.opponent);
  const showMultiplayerSetup = state.isMultiplayer === null || (state.isMultiplayer === true && !multiplayer.opponent);

  return (
    <Layout showHeader={true}>
      <div className={styles.connect4Game}>
        <h3 className={styles.connect4Title}>Connect Four</h3>

        {showMultiplayerSetup && (
          <GameModeSelector
            gameType="connect4"
            isMultiplayer={state.isMultiplayer}
            setMultiplayerMode={setMultiplayerMode}
          />
        )}

        {showGame && (
          <>
            {state.isMultiplayer && multiplayer.roomId && (
              <div className={styles.multiplayerInfo}>
                <span>Room: {multiplayer.roomId}</span>
                {multiplayer.opponent && (
                  <div className={styles.playerNames}>
                    <PlayerText player={PLAYERS.ONE}>
                      {state.myPlayer === PLAYERS.ONE ? multiplayer.playerName || 'You' : (multiplayer.opponent?.name || 'Opponent')} (Red)
                    </PlayerText>
                    <PlayerText player={PLAYERS.TWO}>
                      {state.myPlayer === PLAYERS.TWO ? multiplayer.playerName || 'You' : (multiplayer.opponent?.name || 'Opponent')} (Yellow)
                    </PlayerText>
                  </div>
                )}
              </div>
            )}

            <div className={styles.gameScore}>
              <div>Games Won:</div>
              <PlayerText player={PLAYERS.ONE}>{PLAYERS.ONE}: {state.gamesWon?.[PLAYERS.ONE] || 0}</PlayerText>
              <PlayerText player={PLAYERS.TWO}>{PLAYERS.TWO}: {state.gamesWon?.[PLAYERS.TWO] || 0}</PlayerText>
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
