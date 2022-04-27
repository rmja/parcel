const value = require('./value');
value.foo = 43;

globalThis.output = [value.foo, value];
