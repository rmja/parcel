import { foo } from "./library/a.js";

globalThis.output = import("./async.js").then(v => [foo, v.default]);
