import * as test from './library/index.js';

globalThis.output = test.foo + test['foobar'];
