import * as a from './a.js';

globalThis.output = import('./async').then(mod => mod.__esModule);
