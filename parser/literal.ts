import { possibly, choice, digits, Parser, sequenceOf, str, char, many, anyCharExcept, anyChar } from "arcsecond";
import { bw, join, right, seq, surroundWhitespace } from "./utils.ts";
import { ParserBase, SyntaxKind } from "./base.ts";

const EscapedChar = right(char("\\"), anyChar);

export namespace Literal {
	export const enum StringMode {
		Single,
		Double,
	}

	export class StringType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralString = SyntaxKind.LiteralString;

		constructor(public value: string, public mode: StringMode = StringMode.Double) {
			super();
		}

		static single = bw(str("'"))(
			join(many(choice([EscapedChar, anyCharExcept(char("'")) as unknown as Parser<string>]))),
		).map(value => new StringType(value, StringMode.Single));

		static double = bw(str('"'))(
			join(many(choice([EscapedChar, anyCharExcept(char('"')) as unknown as Parser<string>]))),
		).map(value => new StringType(value, StringMode.Double));

		static parser = choice([StringType.single, StringType.double]);

		toString() {
			if (this.mode === StringMode.Single) return "'" + this.value.replaceAll("'", "\\'") + "'";
			return '"' + this.value.replaceAll('"', '\\"') + '"';
		}
	}

	export class NumberType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralNumber = SyntaxKind.LiteralNumber;

		constructor(public value: number) {
			super();
		}

		static parser = seq([
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

		static parser = choice([str("true"), str("false")]).map(value => new BooleanType(value === "true"));

		toString() {
			return `${this.value}`;
		}
	}

	export class NullType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralNull = SyntaxKind.LiteralNull;

		static parser = str("null").map(() => new NullType());

		toString() {
			return "null";
		}
	}

	export class UndefinedType extends ParserBase {
		primitive: true = true;
		kind: SyntaxKind.LiteralUndefined = SyntaxKind.LiteralUndefined;

		static parser = str("undefined").map(() => new UndefinedType());

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

		static parser = sequenceOf([possibly(surroundWhitespace(str("unique"))), str("symbol")]).map(
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

		static parser = seq([digits, str("n")])
			.map(([digits]) => BigInt(digits))
			.map(value => new BigIntType(value));

		toString() {
			return `${this.value}n`;
		}
	}

	export type Type = StringType | NumberType | BooleanType | NullType | UndefinedType | SymbolType | BigIntType;

	export const parser: Parser<Type> = choice([
		BigIntType.parser,
		NumberType.parser,
		SymbolType.parser,
		BooleanType.parser,
		NullType.parser,
		UndefinedType.parser,
		StringType.parser,
	]);
}
