import { choice, Parser, str } from "npm:arcsecond";
import { ParserBase } from "./base.ts";

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
	export class Any extends ParserBase {
		type: "predefined" = "predefined";
		value: "any" = "any";

		constructor() {
			super();
		}

		static parse = str("any").map(() => new Any());

		toString() {
			return "any";
		}
	}

	export class Number extends ParserBase {
		primitive: true = true;
		type: "number" = "number";
		value: null = null;

		constructor() {
			super();
		}

		static parse = str("number").map(() => new Number());

		toString() {
			return "number";
		}
	}

	export class Boolean extends ParserBase {
		primitive: true = true;
		type: "boolean" = "boolean";
		value: null = null;

		constructor() {
			super();
		}

		static parse = str("boolean").map(() => new Boolean());

		toString() {
			return "boolean";
		}
	}

	export class BigInt extends ParserBase {
		primitive: true = true;
		type: "bigint" = "bigint";
		value: null = null;

		constructor() {
			super();
		}

		static parse = str("bigint").map(() => new BigInt());

		toString() {
			return "bigint";
		}
	}

	export class String extends ParserBase {
		primitive: true = true;
		type: "string" = "string";
		value: null = null;

		constructor() {
			super();
		}

		static parse = str("string").map(() => new String());

		toString() {
			return "string";
		}
	}

	export class Void extends ParserBase {
		type: "predefined" = "predefined";
		value: "void" = "void";

		constructor() {
			super();
		}

		static parse = str("void").map(() => new Void());

		toString() {
			return "void";
		}
	}

	export class Never extends ParserBase {
		type: "predefined" = "predefined";
		value: "never" = "never";

		constructor() {
			super();
		}

		static parse = str("never").map(() => new Never());

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
