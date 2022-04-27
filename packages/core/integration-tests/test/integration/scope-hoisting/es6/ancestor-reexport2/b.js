import { foo } from "./library/b.js";

globalThis.output = import("./async.js").then(v => [foo, v.default]);
