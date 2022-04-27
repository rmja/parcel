module.exports.foo = 'foo'
module.exports = require('./b');
globalThis.output = module.exports;
