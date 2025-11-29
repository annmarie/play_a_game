"use strict";

module.exports = {
  process() {
    try {
      return "module.exports = {};";
    } catch (error) {
      console.warn('CSS transform failed:', error);
      return "module.exports = {};";
    }
  },
  getCacheKey() {
    // The output is always the same.
    return "cssTransform";
  },
};
