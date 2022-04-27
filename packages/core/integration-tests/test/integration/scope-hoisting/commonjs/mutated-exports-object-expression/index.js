const v = require("./value");

let x = ((v.foo = 3), v[["f", "o", "o"].join("")]);

globalThis.output = [v, v.foo, x];
