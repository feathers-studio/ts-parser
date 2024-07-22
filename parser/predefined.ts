import { choice, Parser, str } from "npm:arcsecond";

/*
PredefinedType:
	any
	number
	boolean
	string
	symbol (defined in primitives)
	bigint
	void
	never
*/

export namespace Predefined {
	export class Any {
		type: "predefined" = "predefined";
		value: "any" = "any";

		private constructor() {}

		static from() {
			return new Any();
		}

		static get parse() {
			return str("any").map(() => Any.from());
		}

		toString() {
			return "any";
		}
	}

	export class Number {
		primitive: true = true;
		type: "number" = "number";
		value: null = null;

		private constructor() {}

		static from() {
			return new Number();
		}

		static get parse() {
			return str("number").map(() => Number.from());
		}

		toString() {
			return "number";
		}
	}

	export class Boolean {
		primitive: true = true;
		type: "boolean" = "boolean";
		value: null = null;

		private constructor() {}

		static from() {
			return new Boolean();
		}

		static get parse() {
			return str("boolean").map(() => Boolean.from());
		}

		toString() {
			return "boolean";
		}
	}

	export class BigInt {
		primitive: true = true;
		type: "bigint" = "bigint";
		value: null = null;

		private constructor() {}

		static from() {
			return new BigInt();
		}

		static get parse() {
			return str("bigint").map(() => BigInt.from());
		}

		toString() {
			return "bigint";
		}
	}

	export class String {
		primitive: true = true;
		type: "string" = "string";
		value: null = null;

		private constructor() {}

		static from() {
			return new String();
		}

		static get parse() {
			return str("string").map(() => String.from());
		}

		toString() {
			return "string";
		}
	}

	export class Void {
		type: "predefined" = "predefined";
		value: "void" = "void";

		private constructor() {}

		static from() {
			return new Void();
		}

		static get parse() {
			return str("void").map(() => Void.from());
		}

		toString() {
			return "void";
		}
	}

	export class Never {
		type: "predefined" = "predefined";
		value: "never" = "never";

		private constructor() {}

		static from() {
			return new Never();
		}

		static get parse() {
			return str("never").map(() => Never.from());
		}

		toString() {
			return "never";
		}
	}

	export type Type = Any | Number | Boolean | BigInt | String | Void | Never;

	export const parse: Parser<Type> = choice([
		Any.parse,
		Number.parse,
		Boolean.parse,
		BigInt.parse,
		String.parse,
		Void.parse,
		Never.parse,
	]);
}
