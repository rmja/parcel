import shared from './shared';

globalThis.output = import('./b').then(b => b.out + shared);
