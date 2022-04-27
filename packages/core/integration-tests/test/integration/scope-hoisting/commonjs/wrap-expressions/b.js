function before() {
  sideEffect('before');
  return 'before';
}

function after() {
  sideEffect('after');
  return 'after';
}

globalThis.output = before() + ' ' + require('./require') + ' ' + after();
