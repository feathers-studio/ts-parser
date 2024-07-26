import { possibly, choice, digits, Parser, sequenceOf, str } from "npm:arcsecond";
import { bw, seq, surroundWhitespace } from "./utils.ts";
import { ParserBase } from "./base.ts";

export namespace Literal {
	export class String extends ParserBase {
		primitive: true = true;
		type: "string" = "string";

		constructor(public value: string) {
			super();
		}

		static parse = bw(str('"'), str('"'))().map(value => new String(value));

		toString() {
			return `"${this.value}"`;
		}
	}

	export class Number extends ParserBase {
		primitive: true = true;
		type: "number" = "number";

		constructor(public value: number) {
			super();
		}

		static parse = seq([
			possibly(str("-")), //
			digits,
			possibly(seq([str("."), digits])),
		]).map(([sign, digits]) => new Number(parseInt(`${sign ?? ""}${digits}`)));

		toString() {
			return `${this.value}`;
		}
	}

	export class Boolean extends ParserBase {
		primitive: true = true;
		type: "boolean" = "boolean";

		constructor(public value: boolean) {
			super();
		}

		static parse = choice([str("true"), str("false")]).map(value => new Boolean(value === "true"));

		toString() {
			return `${this.value}`;
		}
	}

	export class Null extends ParserBase {
		primitive: true = true;
		type: "null" = "null";

		static parse = str("null").map(() => new Null());

		toString() {
			return "null";
		}
	}

	export class Undefined extends ParserBase {
		primitive: true = true;
		type: "undefined" = "undefined";

		static parse = str("undefined").map(() => new Undefined());

		toString() {
			return "undefined";
		}
	}

	export class SymbolType extends ParserBase {
		primitive: true = true;
		type: "symbol" = "symbol";

		constructor(public unique: boolean) {
			super();
		}

		static parse = sequenceOf([possibly(surroundWhitespace(str("unique"))), str("symbol")]).map(
			([unique]) => new SymbolType(unique !== null),
		);

		toString() {
			return `symbol${this.unique ? " unique" : ""}`;
		}
	}

	export class BigIntType extends ParserBase {
		primitive: true = true;
		type: "bigint" = "bigint";

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

	export type Type = String | Number | Boolean | Null | Undefined | SymbolType | BigIntType;

	export const parse: Parser<Type> = choice([
		BigIntType.parse,
		Number.parse,
		SymbolType.parse,
		Boolean.parse,
		Null.parse,
		Undefined.parse,
		String.parse,
	]);
}
