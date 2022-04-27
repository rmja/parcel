import {test} from './b'

globalThis.output = test(exports => Object.keys(exports))
