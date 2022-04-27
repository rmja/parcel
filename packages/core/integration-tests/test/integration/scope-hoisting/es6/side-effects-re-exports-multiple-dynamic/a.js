import Foo from "lib";

globalThis.output = import("./b.js").then(v => ([Foo, v]));
