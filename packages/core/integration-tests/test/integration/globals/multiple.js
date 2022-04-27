const getGlobals = require('./index.js');

globalThis.output = {
  file: __filename,
  other: getGlobals().file
};
