// Encode/decode state to/from URL
export const encodeBoardState = (state) => {
  const data = {
    board: state.board,
    player: state.player,
    winner: state.winner,
    winnerDesc: state.winnerDesc,
    boardFull: state.boardFull
  };
  return btoa(JSON.stringify(data));
};

export const decodeBoardState = (encoded) => {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
};
