// Encode/decode board state to/from URL
export const encodeBoardState = (state) => {
  const data = {
    points: state.points.map(p => ({ id: p.id, checkers: p.checkers, player: p.player })),
    checkersOnBar: state.checkersOnBar,
    checkersBornOff: state.checkersBornOff,
    player: state.player,
    diceValue: state.diceValue
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

// Usage: Add ?board=<encoded> to URL to load specific board
export const loadBoardFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('board');
  return encoded ? decodeBoardState(encoded) : null;
};