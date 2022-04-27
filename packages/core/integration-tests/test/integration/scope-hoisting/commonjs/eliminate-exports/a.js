var b = require('./b');

b.setFoo(3);
globalThis.output = b.foo + b['bar'];
