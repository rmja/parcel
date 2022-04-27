// ensure lib is hoisted (without using any exports) to simulate bundle reference in b.js
import 'lib';

globalThis.output = import('./b').then(p => p.default + p.foo + 456);
