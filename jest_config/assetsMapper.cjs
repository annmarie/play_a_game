"use strict";

module.exports = {
  process(src, filename, config, options) {
    const basename = filename.split('/').pop().split('\\').pop();
    return 'module.exports = ' + JSON.stringify(path.basename(filename)) + ';';
  },
};
