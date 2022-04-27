require('./b').foo = 4;
globalThis.output = require('./b').foo;
