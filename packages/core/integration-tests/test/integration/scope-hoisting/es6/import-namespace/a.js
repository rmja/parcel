import * as test from './b';

let x = test;

globalThis.output = x.foo;
