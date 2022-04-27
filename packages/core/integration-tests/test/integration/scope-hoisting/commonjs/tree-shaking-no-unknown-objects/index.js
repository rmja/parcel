const foo = require('./a');
foo.bar = 42;
globalThis.output = window.bar;
