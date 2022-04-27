import prefix from "./b.js";

class Foo {
	x(v) {
		return prefix + v;
	}
	y = (v) => {
		return this.x(v);
	};
}

let result = new Foo().y(123);

globalThis.output = result;
export default result;
