import { choice, Parser, str } from "./deps/arcsecond.ts";
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

		static parser = str("any").map(() => new AnyType());

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

		static parser = str("number").map(() => new NumberType());

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

		static parser = str("boolean").map(() => new BooleanType());

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

		static parser = str("bigint").map(() => new BigIntType());

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

		static parser = str("string").map(() => new StringType());

		toString() {
			return "string";
		}
	}

	export class VoidType extends ParserBase {
		kind: SyntaxKind.PredefinedVoid = SyntaxKind.PredefinedVoid;

		constructor() {
			super();
		}

		static parser = str("void").map(() => new VoidType());

		toString() {
			return "void";
		}
	}

	export class NeverType extends ParserBase {
		kind: SyntaxKind.PredefinedNever = SyntaxKind.PredefinedNever;

		constructor() {
			super();
		}

		static parser = str("never").map(() => new NeverType());

		toString() {
			return "never";
		}
	}

	export type Type = AnyType | NumberType | BooleanType | BigIntType | StringType | VoidType | NeverType;

	export const parser: Parser<Type> = choice([
		AnyType.parser,
		NumberType.parser,
		BooleanType.parser,
		BigIntType.parser,
		StringType.parser,
		VoidType.parser,
		NeverType.parser,
	]);
}
