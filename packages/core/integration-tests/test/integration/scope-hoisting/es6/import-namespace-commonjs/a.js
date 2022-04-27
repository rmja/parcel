import {foo} from './c';

globalThis.output = import('./b').then(function (b) {
  return foo + b.foo;
});

