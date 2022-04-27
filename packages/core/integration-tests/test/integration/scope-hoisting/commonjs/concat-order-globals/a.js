const other = require("./b.js");

globalThis.output = Buffer.from(other).toString();
