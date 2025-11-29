// Shared encode/decode utilities for board state
export const encodeBoardState = (state) => {
  try {
    return btoa(JSON.stringify(state));
  } catch {
    return null;
  }
};

export const decodeBoardState = (encoded) => {
  if (!encoded) return null;
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
};

// Usage: Add ?board=<encoded> to URL to load specific board
export const loadBoardFromURL = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('board');
    return decodeBoardState(encoded);
  } catch {
    return null;
  }
};