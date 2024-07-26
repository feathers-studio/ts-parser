import { choice, Parser, str } from "npm:arcsecond";
import { ParserBase, SyntaxKind } from "./base.ts";

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
		kind: SyntaxKind.PredefinedAny = SyntaxKind.PredefinedAny;

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
		kind: SyntaxKind.LiteralNumber = SyntaxKind.LiteralNumber;
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
		kind: SyntaxKind.LiteralBoolean = SyntaxKind.LiteralBoolean;
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
		kind: SyntaxKind.LiteralBigInt = SyntaxKind.LiteralBigInt;
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
		kind: SyntaxKind.LiteralString = SyntaxKind.LiteralString;
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
		kind: SyntaxKind.PredefinedVoid = SyntaxKind.PredefinedVoid;

		constructor() {
			super();
		}

		static parse = str("void").map(() => new VoidType());

		toString() {
			return "void";
		}
	}

	export class NeverType extends ParserBase {
		kind: SyntaxKind.PredefinedNever = SyntaxKind.PredefinedNever;

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
