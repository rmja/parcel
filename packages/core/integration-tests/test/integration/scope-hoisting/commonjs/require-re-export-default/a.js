const {foo, baz} = require('./b');

globalThis.output = foo + baz;
