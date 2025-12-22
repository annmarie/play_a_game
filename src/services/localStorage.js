const STORAGE_KEYS = {
  USER_NAME: 'playagame_username'
};

export const localStorageService = {
  saveUserName(name) {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  },

  getUserName() {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME);
  },

  clearUserData() {
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
  }
};
