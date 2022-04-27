import { themed } from './theme/components.js';

globalThis.output = import('./media-card/index.js').then(m => [m.default, themed()])
