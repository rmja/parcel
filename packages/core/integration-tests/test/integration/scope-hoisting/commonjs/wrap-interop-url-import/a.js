function run() {
	return require("./b.js");
}

globalThis.output = run().default;
