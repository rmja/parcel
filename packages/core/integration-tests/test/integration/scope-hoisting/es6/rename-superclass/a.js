import Superclass from './b';

class Test extends Superclass {}

globalThis.output = new Test().parentMethod();
