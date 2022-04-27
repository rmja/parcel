if (Date.now() < 0) {
	require("./c.js");
}
import * as b from "./b";

globalThis.output = b.foo;
