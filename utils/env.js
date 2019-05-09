const { resolve, join } = require("path");

const APP_ROOT = resolve();
const LOCAL_ROOT = resolve(__dirname, "..");

const getAppRelPath = p => join(APP_ROOT, p);
const getLocalRelPath = p => join(LOCAL_ROOT, p);

module.exports = {
  APP_ROOT,
  LOCAL_ROOT,
  getAppRelPath,
  getLocalRelPath
};
