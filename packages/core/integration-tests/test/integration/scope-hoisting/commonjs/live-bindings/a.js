const b = require('./b');

b.changeFoo(3);

globalThis.output = b.default + b.foo + b.bar;
