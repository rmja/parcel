import dep from './dep';

globalThis.output = import('./get-dep')
  .then(mod => mod.default)
  .then(asyncDep => [dep, asyncDep]);
