import { possibly, choice, digits, Parser, sequenceOf, str } from "npm:arcsecond";
import { bw, seq, wsed } from "./utils.ts";

export namespace Literal {
	export class String {
		primitive: true = true;
		type: "string" = "string";
		constructor(public value: string) {}

		static from(value: string) {
			return new String(value);
		}

		static get parse() {
			return bw(str('"'), str('"'))().map(value => new String(value));
		}

		toString() {
			return `"${this.value}"`;
		}
	}

	export class Number {
		primitive: true = true;
		type: "number" = "number";
		constructor(public value: number) {}

		static from(value: number) {
			return new Number(value);
		}

		static get parse() {
			return seq([
				possibly(str("-")), //
				digits,
				possibly(seq([str("."), digits])),
			]).map(([sign, digits]) => new Number(parseInt(`${sign ?? ""}${digits}`)));
		}

		toString() {
			return `${this.value}`;
		}
	}

	export class Boolean {
		primitive: true = true;
		type: "boolean" = "boolean";
		constructor(public value: boolean) {}

		static from(value: boolean) {
			return new Boolean(value);
		}

		static get parse() {
			return choice([str("true"), str("false")]).map(value => new Boolean(value === "true"));
		}

		toString() {
			return `${this.value}`;
		}
	}

	export class Null {
		primitive: true = true;
		type: "null" = "null";

		static from() {
			return new Null();
		}

		static get parse() {
			return str("null").map(() => new Null());
		}

		toString() {
			return "null";
		}
	}

	export class Undefined {
		primitive: true = true;
		type: "undefined" = "undefined";

		static from() {
			return new Undefined();
		}

		static get parse() {
			return str("undefined").map(() => new Undefined());
		}

		toString() {
			return "undefined";
		}
	}

	export class SymbolType {
		primitive: true = true;
		type: "symbol" = "symbol";
		constructor(public unique: boolean) {}

		static from(unique: boolean) {
			return new SymbolType(unique);
		}

		static get parse() {
			return sequenceOf([possibly(wsed(str("unique"))), str("symbol")]).map(
				([unique]) => new SymbolType(unique !== null),
			);
		}

		toString() {
			return `symbol${this.unique ? " unique" : ""}`;
		}
	}

	export class BigIntType {
		primitive: true = true;
		type: "bigint" = "bigint";
		constructor(public value: bigint) {}

		static from(value: bigint) {
			return new BigIntType(value);
		}

		static get parse() {
			return seq([digits, str("n")])
				.map(([digits]) => BigInt(digits))
				.map(value => new BigIntType(value));
		}

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
