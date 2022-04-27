import sharedBundle from './shared';
const importBundle = import('./import');

globalThis.output = importBundle.then(importValue => importValue.default + ':' + sharedBundle.foo);
