import {createAndFireEvent} from './b.js';
const createAndFireEventOnAtlaskit = createAndFireEvent('index');
globalThis.output = import('./async.js').then(m => [
	createAndFireEventOnAtlaskit(),
	m.default(),
]);
