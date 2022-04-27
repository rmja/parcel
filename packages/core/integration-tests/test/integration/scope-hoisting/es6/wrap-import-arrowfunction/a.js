const f = () => import("./b.js");

globalThis.output = f;
