const a = require('./a');

if (false) {
  console.log(a);
}

globalThis.output = a;
