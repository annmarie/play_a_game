// Utility functions for encoding and decoding game board state to/from URL
const encodeBoardState = (state) => {
  try {
    return btoa(JSON.stringify(state));
  } catch {
    return null;
  }
};

const decodeBoardState = (encoded) => {
  if (!encoded) return null;
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
};

export const createSaveToURL = (historyFields = []) => (state) => {
  const getLastItem = (arr) => arr.length > 0 ? [arr[arr.length - 1]] : [];

  const dataToSave = { ...state };

  // Trim history arrays to only keep the last item
  historyFields.forEach(field => {
    if (state[field]) {
      dataToSave[field] = getLastItem(state[field]);
    }
  });

  const encoded = encodeBoardState(dataToSave);
  const url = `${window.location.origin}${window.location.pathname}?board=${encoded}`;

  navigator.clipboard.writeText(url).catch((err) => {
    console.error('Failed to copy URL to clipboard:', err);
  });

  return state;
};

export const createLoadFromURL = (postProcessFn) => (state) => {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('board');
    if (!encoded) return state;

    const boardState = decodeBoardState(encoded);
    if (!boardState) return state;

    const newState = { ...state, ...boardState };

    // Remove board parameter from URL after loading
    const url = new URL(window.location);
    url.searchParams.delete('board');
    window.history.replaceState({}, '', url);

    // Apply game-specific post-processing if provided
    return postProcessFn ? postProcessFn(newState) : newState;
  } catch (error) {
    console.warn('Failed to load board from URL:', error);
    return state;
  }
};
