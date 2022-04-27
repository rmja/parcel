var foo;
(function (foo) {
  foo["bar"] = "bar";
})(foo = exports.foo || (exports.foo = {}));
globalThis.output = exports;
