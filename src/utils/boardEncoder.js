// Shared encode/decode utilities for board state
export const encodeBoardState = (state) => {
  return btoa(JSON.stringify(state));
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