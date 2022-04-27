"use strict";

module.exports.a = () => 1;

var b = require("./b.js");

globalThis.output = b + 1;
