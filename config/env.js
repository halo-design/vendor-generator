const { resolve } = require('path');

module.exports = {
  getAppPath: dir => resolve(dir),
  getLocalPath: dir => resolve(__dirname, '..', dir),
};
