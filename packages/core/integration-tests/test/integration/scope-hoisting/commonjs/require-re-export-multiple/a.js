const {foo, bar, baz, d} = require('./b');

globalThis.output = foo + bar + baz + d;
