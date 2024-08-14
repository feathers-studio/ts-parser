import {
	possibly,
	choice,
	digits,
	Parser,
	sequenceOf,
	str,
	char,
	many,
	anyCharExcept,
	anyOfString,
	fail,
	coroutine,
	lookAhead,
	skip,
} from "arcsecond";
import { bw, join, seq, surroundWhitespace } from "./utils.ts";
import { ParserBase, SyntaxKind } from "./base.ts";

/*
\0 	null character (U+0000 NULL)
\' 	single quote (U+0027 APOSTROPHE)
\" 	double quote (U+0022 QUOTATION MARK)
\\ 	backslash (U+005C REVERSE SOLIDUS)
\n 	newline (U+000A LINE FEED; LF)
\r 	carriage return (U+000D CARRIAGE RETURN; CR)
\v 	vertical tab (U+000B LINE TABULATION)
\t 	tab (U+0009 CHARACTER TABULATION)
\b 	backspace (U+0008 BACKSPACE)
\f 	form feed (U+000C FORM FEED)
\ followed by a line terminator 	empty string
*/

const Hex = anyOfString("0123456789abcdefABCDEF");

const EscapedChar = choice([
	str("\\0").map(() => "\0"),
	str("\\'").map(() => "'"),
	str('\\"').map(() => '"'),
	str("\\\\").map(() => "\\"),
	str("\\n").map(() => "\n"),
	str("\\r").map(() => "\r"),
	str("\\v").map(() => "\v"),
	str("\\t").map(() => "\t"),
	str("\\b").map(() => "\b"),
	str("\\f").map(() => "\f"),
	str("\\\n").map(() => ""),

	// Hexadecimal escape sequence
	seq([str("\\x"), Hex, Hex]).map(([_, a, b]) => String.fromCharCode(parseInt(a + b, 16))),

	// TODO: Surrogate pairs not supported atm
	// seq([str("\\u"), Hex, Hex, Hex, Hex, str("\\u"), Hex, Hex, Hex, Hex]).map(([_1, a, b, c, d, _2, e, f, g, h]) =>
	// 	String.fromCharCode(parseInt(a + b + c + d, 16) + parseInt(e + f + g + h, 16)),
	// ),

	// Unicode escape sequence
	seq([str("\\u"), Hex, Hex, Hex, Hex]).map(([_, a, b, c, d]) => String.fromCharCode(parseInt(a + b + c + d, 16))),

	// Extended Unicode escape sequence
	// TODO: This should ideally result in parse error over \u{10FFFF}, but it parses literally as
	//       "\u{11FFFF}" because Arcsecond parses as string instead when escape sequence errors
	coroutine(run => {
		run(str("\\u{"));
		const match = run(lookAhead(join(many(Hex))));
		if (!match) run(fail("Hexadecimal digit expected"));
		const codePoint = parseInt(match, 16);
		if (codePoint > 0x10ffff)
			run(fail("An extended Unicode escape value must be between 0x0 and 0x10FFFF inclusive."));
		run(skip(str(match)));
		run(str("}"));
		return String.fromCodePoint(codePoint);
	}),
]);

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

		static of = (type: '"' | "'") =>
			bw(str(type))(
				join(
					many(
						choice([
							EscapedChar,
							anyCharExcept(choice([char(type), EscapedChar])) as unknown as Parser<string>,
						]),
					),
				),
			).map(value => new StringType(value, type === '"' ? StringMode.Double : StringMode.Single));

		static single = StringType.of("'");
		static double = StringType.of('"');
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
