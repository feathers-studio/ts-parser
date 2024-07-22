import { possibly, choice, digits, Parser, sequenceOf, str } from "npm:arcsecond";
import { bw, wsed } from "./utils.ts";

export declare namespace LiteralType {
	interface String {
		primitive: true;
		type: "string";
		value: string;
	}

	interface Number {
		primitive: true;
		type: "number";
		value: number;
	}

	interface Boolean {
		primitive: true;
		type: "boolean";
		value: boolean;
	}

	interface Null {
		primitive: true;
		type: "null";
	}

	interface Undefined {
		primitive: true;
		type: "undefined";
	}

	interface Symbol {
		primitive: true;
		type: "symbol";
		unique: boolean;
	}

	interface BigInt {
		primitive: true;
		type: "bigint";
		value: bigint;
	}
}

export type LiteralType =
	| LiteralType.String
	| LiteralType.Number
	| LiteralType.Boolean
	| LiteralType.Null
	| LiteralType.Undefined
	| LiteralType.Symbol
	| LiteralType.BigInt;

export const string: Parser<LiteralType.String> = bw(str('"'), str('"'))() //
	.map(value => ({ primitive: true, type: "string", value }));

export const number: Parser<LiteralType.Number> = digits //
	.map(value => ({ primitive: true, type: "number", value: Number(value) }));

export const boolean: Parser<LiteralType.Boolean> = choice([str("true"), str("false")]) //
	.map(value => ({ primitive: true, type: "boolean", value: value === "true" }));

export const nullType: Parser<LiteralType.Null> = str("null") //
	.map(() => ({ primitive: true, type: "null" }));

export const undefinedType: Parser<LiteralType.Undefined> = str("undefined") //
	.map(() => ({ primitive: true, type: "undefined" }));

export const symbol: Parser<LiteralType.Symbol> = sequenceOf([possibly(wsed(str("unique"))), str("symbol")]) //
	.map(([unique]) => ({ primitive: true, type: "symbol", unique: unique !== null }));

export const bigint: Parser<LiteralType.BigInt> = sequenceOf([digits, str("n")])
	.map(([digits]) => BigInt(digits))
	.map(value => ({ primitive: true, type: "bigint", value }));

export const LiteralType: Parser<LiteralType> = choice([
	symbol,
	bigint,
	number,
	boolean,
	nullType,
	undefinedType,
	string,
]);
