import { BUTTON_TEXT, PLAYER, ARIA_LABELS, GAME_TEXT } from './globals';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, undoMove, playAgain } from './slice';
import { useWebSocketHandlers } from './hooks/useWebSocketHandlers';
import StatusBox from './components/StatusBox';
import Board from './components/Board';
import PlayerText from './components/PlayerText';
import RoomStatus from './components/RoomStatus';
import Multiplayer from '@/components/Multiplayer';
import { shouldShowMultiplayerSetup } from '@/components/Multiplayer/multiplayerUtils';
import styles from './Connect4.module.css';
import Layout from '@/components/Layout';

const Connect4 = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.connect4);
  const multiplayer = useSelector((state) => state.multiplayer || {});

  useWebSocketHandlers();

  const handleCellClick = (col) => {
    if (state.isMultiplayer && !state.isMyTurn) return;
    if (state.winner || state.boardFull) return;
    dispatch(makeMove({ col }));
  };

  return (
    <Layout showHeader={true}>
      <div className={styles.connect4Game}>
        <h3 className={styles.connect4Title}>{GAME_TEXT.TITLE}</h3>

        {shouldShowMultiplayerSetup(state.isMultiplayer, multiplayer.rooms?.connect4?.opponent) && (
          <Multiplayer gameType="connect4" />
        )}

        {(state.isMultiplayer && multiplayer.rooms?.connect4?.opponent) && (
          <>
            <RoomStatus
              roomId={multiplayer.rooms.connect4.roomId}
              opponent={multiplayer.rooms.connect4.opponent}
              myPlayer={state.myPlayer}
              playerName={multiplayer.playerName}
            />

            <div className={styles.gameScore}>
              <div>Games Won:</div>
              <PlayerText player={PLAYER.ONE}>{PLAYER.ONE}: {state.gamesWon?.[PLAYER.ONE] || 0}</PlayerText>
              <PlayerText player={PLAYER.TWO}>{PLAYER.TWO}: {state.gamesWon?.[PLAYER.TWO] || 0}</PlayerText>
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
            />

            <div className={styles.connect4Actions}>
              <button
                aria-label={ARIA_LABELS.UNDO_MOVE}
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
