import { possibly, choice, digits, Parser, sequenceOf, str } from "arcsecond";
import { bw, seq, surroundWhitespace } from "./utils.ts";
import { ParserBase, SyntaxKind } from "./base.ts";

export namespace Literal {
	export class StringType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralString = SyntaxKind.LiteralString;

		constructor(public value: string) {
			super();
		}

		static parse = bw(str('"'))().map(value => new StringType(value));

		toString() {
			return `"${this.value.replaceAll('"', '\\"')}"`;
		}
	}

	export class NumberType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralNumber = SyntaxKind.LiteralNumber;

		constructor(public value: number) {
			super();
		}

		static parse = seq([
			possibly(str("-")), //
			digits,
			possibly(seq([str("."), digits]).map(([dot, digits]) => dot + digits)),
			possibly(seq([str("e"), possibly(str("-")), digits]).map(([e, sign, digits]) => e + (sign ?? "") + digits)),
		]).map(
			([sign, digits, rest, exponent]) =>
				new NumberType(parseFloat((sign ?? "") + digits + (rest ?? "") + (exponent ?? ""))),
		);

		toString() {
			return `${this.value}`;
		}
	}

	export class BooleanType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralBoolean = SyntaxKind.LiteralBoolean;

		constructor(public value: boolean) {
			super();
		}

		static parse = choice([str("true"), str("false")]).map(value => new BooleanType(value === "true"));

		toString() {
			return `${this.value}`;
		}
	}

	export class NullType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralNull = SyntaxKind.LiteralNull;

		static parse = str("null").map(() => new NullType());

		toString() {
			return "null";
		}
	}

	export class UndefinedType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralUndefined = SyntaxKind.LiteralUndefined;

		static parse = str("undefined").map(() => new UndefinedType());

		toString() {
			return "undefined";
		}
	}

	export class SymbolType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralSymbol = SyntaxKind.LiteralSymbol;

		constructor(public unique: boolean) {
			super();
		}

		static parse = sequenceOf([possibly(surroundWhitespace(str("unique"))), str("symbol")]).map(
			([unique]) => new SymbolType(unique !== null),
		);

		toString() {
			if (this.unique) return "unique symbol";
			return "symbol";
		}
	}

	export class BigIntType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralBigInt = SyntaxKind.LiteralBigInt;

		constructor(public value: bigint) {
			super();
		}

		static parse = seq([digits, str("n")])
			.map(([digits]) => BigInt(digits))
			.map(value => new BigIntType(value));

		toString() {
			return `${this.value}n`;
		}
	}

	export type Type = StringType | NumberType | BooleanType | NullType | UndefinedType | SymbolType | BigIntType;

	export const parse: Parser<Type> = choice([
		BigIntType.parse,
		NumberType.parse,
		SymbolType.parse,
		BooleanType.parse,
		NullType.parse,
		UndefinedType.parse,
		StringType.parse,
	]);
}
