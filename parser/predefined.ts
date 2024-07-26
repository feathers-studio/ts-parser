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
	export class AnyType extends ParserBase {
		type: "predefined" = "predefined";
		value: "any" = "any";

		constructor() {
			super();
		}

		static parse = str("any").map(() => new AnyType());

		toString() {
			return "any";
		}
	}

	export class NumberType extends ParserBase {
		primitive: true = true;
		type: "number" = "number";
		value: null = null;

		constructor() {
			super();
		}

		static parse = str("number").map(() => new NumberType());

		toString() {
			return "number";
		}
	}

	export class BooleanType extends ParserBase {
		primitive: true = true;
		type: "boolean" = "boolean";
		value: null = null;

		constructor() {
			super();
		}

		static parse = str("boolean").map(() => new BooleanType());

		toString() {
			return "boolean";
		}
	}

	export class BigIntType extends ParserBase {
		primitive: true = true;
		type: "bigint" = "bigint";
		value: null = null;

		constructor() {
			super();
		}

		static parse = str("bigint").map(() => new BigIntType());

		toString() {
			return "bigint";
		}
	}

	export class StringType extends ParserBase {
		primitive: true = true;
		type: "string" = "string";
		value: null = null;

		constructor() {
			super();
		}

		static parse = str("string").map(() => new StringType());

		toString() {
			return "string";
		}
	}

	export class VoidType extends ParserBase {
		type: "predefined" = "predefined";
		value: "void" = "void";

		constructor() {
			super();
		}

		static parse = str("void").map(() => new VoidType());

		toString() {
			return "void";
		}
	}

	export class NeverType extends ParserBase {
		type: "predefined" = "predefined";
		value: "never" = "never";

		constructor() {
			super();
		}

		static parse = str("never").map(() => new NeverType());

		toString() {
			return "never";
		}
	}

	export type Type = AnyType | NumberType | BooleanType | BigIntType | StringType | VoidType | NeverType;

	export const parse: Parser<Type> = choice([
		AnyType.parse,
		NumberType.parse,
		BooleanType.parse,
		BigIntType.parse,
		StringType.parse,
		VoidType.parse,
		NeverType.parse,
	]);
}
