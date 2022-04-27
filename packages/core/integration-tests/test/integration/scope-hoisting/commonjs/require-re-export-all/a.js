const {foo, bar, baz} = require('./b');

globalThis.output = foo + bar + baz;
