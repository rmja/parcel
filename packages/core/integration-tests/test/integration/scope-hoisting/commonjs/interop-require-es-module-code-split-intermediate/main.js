import mainValue from './main_child';
const importBundle = import('./import');

globalThis.output = importBundle.then(importValue => importValue.default + ':' + mainValue);
