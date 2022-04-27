import value from './value';

globalThis.output = import('./async').then(mod => mod.default);
