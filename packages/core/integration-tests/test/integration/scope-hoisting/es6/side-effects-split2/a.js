import * as x from 'lib';

globalThis.output = import('./b').then(p => [x, p.default + p.foo + 456]);
