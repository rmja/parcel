import _default, {other} from './a.js';

globalThis.output = import('./async').then(mod => mod.default);
