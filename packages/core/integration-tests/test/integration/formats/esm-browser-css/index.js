import './index.css';
globalThis.output = import('./async').then(a => a.foo + 2);
