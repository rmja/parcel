import {ns, ns2} from './reexports';

globalThis.output = import('./async').then(mod => [ns.foo, ns2.foo].concat(mod.default));
