import * as foo from './foo';

globalThis.output = foo['def' + (Date.now() > 0 ? 'ault' : '')];
