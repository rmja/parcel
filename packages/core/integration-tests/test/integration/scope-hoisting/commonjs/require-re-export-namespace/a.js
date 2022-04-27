const {c, baz} = require('./b');

globalThis.output = c.foo + c.bar + baz;
