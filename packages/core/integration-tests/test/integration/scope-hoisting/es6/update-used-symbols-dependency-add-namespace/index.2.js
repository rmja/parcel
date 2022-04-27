import * as x from './library/emoji';
globalThis.output = import('./library/Toolbar').then(v => [v, x]);
