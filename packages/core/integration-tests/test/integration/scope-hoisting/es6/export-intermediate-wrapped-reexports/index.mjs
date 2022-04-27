import { bar } from "./foo/foo.mjs";

globalThis.output = [bar, import("./async").then(mod => mod.default)];
