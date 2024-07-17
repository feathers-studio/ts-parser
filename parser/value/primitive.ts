import { choice, digits, Parser, sequenceOf, str } from "npm:arcsecond";
import { assertParser, bw } from "../utils.ts";

export declare namespace Primitive {
	interface String {
		primitive: true;
		type: "string";
		value: string | null;
	}

	interface Number {
		primitive: true;
		type: "number";
		value: number | null;
	}

	interface Boolean {
		primitive: true;
		type: "boolean";
		value: boolean | null;
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
	}

	interface BigInt {
		primitive: true;
		type: "bigint";
		value: bigint | null;
	}
}

export type Primitive =
	| Primitive.String
	| Primitive.Number
	| Primitive.Boolean
	| Primitive.Null
	| Primitive.Undefined
	| Primitive.Symbol
	| Primitive.BigInt;

export const string: Parser<Primitive.String> = choice([str("string"), bw(str('"'), str('"'))()]) //
	.map(value =>
		value === "string"
			? { primitive: true, type: "string", value: null }
			: { primitive: true, type: "string", value },
	);

export const number: Parser<Primitive.Number> = choice([str("number"), digits]).map(value =>
	value === "number"
		? { primitive: true, type: "number", value: null }
		: { primitive: true, type: "number", value: Number(value) },
);

export const boolean: Parser<Primitive.Boolean> = choice([str("boolean"), str("true"), str("false")]).map(value =>
	value === "boolean"
		? { primitive: true, type: "boolean", value: null }
		: { primitive: true, type: "boolean", value: value === "true" },
);

export const nullValue: Parser<Primitive.Null> = str("null") //
	.map(() => ({ primitive: true, type: "null" }));

export const undefinedValue: Parser<Primitive.Undefined> = str("undefined") //
	.map(() => ({ primitive: true, type: "undefined" }));

export const symbol: Parser<Primitive.Symbol> = str("symbol") //
	.map(() => ({ primitive: true, type: "symbol" }));

export const bigint: Parser<Primitive.BigInt> = sequenceOf([digits, str("n")])
	.map(([digits]) => BigInt(digits))
	.map(value => ({ primitive: true, type: "bigint", value }));

export const primitive: Parser<Primitive> = choice([
	symbol,
	bigint,
	number,
	boolean,
	nullValue,
	undefinedValue,
	string,
]);

Deno.test("primitive:string", () => {
	assertParser(string, '"Hello, World!"', { primitive: true, type: "string", value: "Hello, World!" });
});

Deno.test("primitive:number", () => {
	assertParser(number, "123", { primitive: true, type: "number", value: 123 });
});

Deno.test("primitive:boolean", () => {
	assertParser(boolean, "true", { primitive: true, type: "boolean", value: true });
});

Deno.test("primitive:null", () => {
	assertParser(nullValue, "null", { primitive: true, type: "null" });
});

Deno.test("primitive:undefined", () => {
	assertParser(undefinedValue, "undefined", { primitive: true, type: "undefined" });
});

Deno.test("primitive:symbol", () => {
	assertParser(symbol, "symbol", { primitive: true, type: "symbol" });
});

Deno.test("primitive:bigint", () => {
	assertParser(bigint, "123n", { primitive: true, type: "bigint", value: 123n });
});

Deno.test("any-primitive:string", () => {
	assertParser(primitive, '"Hello, World!"', { primitive: true, type: "string", value: "Hello, World!" });
});

Deno.test("any-primitive:number", () => {
	assertParser(primitive, "123", { primitive: true, type: "number", value: 123 });
});

Deno.test("any-primitive:boolean", () => {
	assertParser(primitive, "true", { primitive: true, type: "boolean", value: true });
});

Deno.test("any-primitive:null", () => {
	assertParser(primitive, "null", { primitive: true, type: "null" });
});

Deno.test("any-primitive:undefined", () => {
	assertParser(primitive, "undefined", { primitive: true, type: "undefined" });
});

Deno.test("any-primitive:symbol", () => {
	assertParser(primitive, "symbol", { primitive: true, type: "symbol" });
});

Deno.test("any-primitive:bigint", () => {
	assertParser(primitive, "123n", { primitive: true, type: "bigint", value: 123n });
});
