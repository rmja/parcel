import b, {foo, bar, changeFoo} from './b';

changeFoo(3);

globalThis.output = b + foo + bar;
