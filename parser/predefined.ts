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

		private constructor() {
			super();
		}

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

	export class Number extends ParserBase {
		primitive: true = true;
		type: "number" = "number";
		value: null = null;

		private constructor() {
			super();
		}

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

	export class Boolean extends ParserBase {
		primitive: true = true;
		type: "boolean" = "boolean";
		value: null = null;

		private constructor() {
			super();
		}

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

	export class BigInt extends ParserBase {
		primitive: true = true;
		type: "bigint" = "bigint";
		value: null = null;

		private constructor() {
			super();
		}

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

	export class String extends ParserBase {
		primitive: true = true;
		type: "string" = "string";
		value: null = null;

		private constructor() {
			super();
		}

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

	export class Void extends ParserBase {
		type: "predefined" = "predefined";
		value: "void" = "void";

		private constructor() {
			super();
		}

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

	export class Never extends ParserBase {
		type: "predefined" = "predefined";
		value: "never" = "never";

		private constructor() {
			super();
		}

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
