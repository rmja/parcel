import c from "./client";
import v from "./viewer";

globalThis.output = Promise.all([c(), v()]);
// ["hasher", ["hasher", "hasher"]]
