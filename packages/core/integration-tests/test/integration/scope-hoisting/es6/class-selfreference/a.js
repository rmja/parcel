class Bar {
  constructor() {
    this.foo = 'bar';
  }

  duplicate() {
    return new Bar();
  }
}

globalThis.output = new Bar().duplicate();
