import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { choice, digits, Parser, sequenceOf, str } from "npm:arcsecond";
import { bw } from "../utils.ts";

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
	const result = string.run('"Hello, World!"');
	assert(!result.isError);
	assertEquals(result.result, { primitive: true, type: "string", value: "Hello, World!" });
});

Deno.test("primitive:number", () => {
	const result = number.run("123");
	assert(!result.isError);
	assertEquals(result.result, { primitive: true, type: "number", value: 123 });
});

Deno.test("primitive:boolean", () => {
	const result = boolean.run("false");
	assert(!result.isError);
	assertEquals(result.result, { primitive: true, type: "boolean", value: false });
});

Deno.test("primitive:null", () => {
	const result = nullValue.run("null");
	assert(!result.isError);
	assertEquals(result.result, { primitive: true, type: "null" });
});

Deno.test("primitive:undefined", () => {
	const result = undefinedValue.run("undefined");
	assert(!result.isError);
	assertEquals(result.result, { primitive: true, type: "undefined" });
});

Deno.test("primitive:symbol", () => {
	const result = symbol.run("symbol");
	assert(!result.isError);
	assertEquals(result.result, { primitive: true, type: "symbol" });
});

Deno.test("primitive:bigint", () => {
	const result = bigint.run("123n");
	assert(!result.isError);
	assertEquals(result.result, { primitive: true, type: "bigint", value: 123n });
});

Deno.test("primitive", () => {
	{
		const result = primitive.run('"Hello, World!"');
		assert(!result.isError);
		assertEquals(result.result, { primitive: true, type: "string", value: "Hello, World!" });
	}

	{
		const result = primitive.run("123");
		assert(!result.isError);
		assertEquals(result.result, { primitive: true, type: "number", value: 123 });
	}

	{
		const result = primitive.run("false");
		assert(!result.isError);
		assertEquals(result.result, { primitive: true, type: "boolean", value: false });
	}

	{
		const result = primitive.run("null");
		assert(!result.isError);
		assertEquals(result.result, { primitive: true, type: "null" });
	}

	{
		const result = primitive.run("undefined");
		assert(!result.isError);
		assertEquals(result.result, { primitive: true, type: "undefined" });
	}

	{
		const result = primitive.run("symbol");
		assert(!result.isError);
		assertEquals(result.result, { primitive: true, type: "symbol" });
	}

	{
		const result = primitive.run("123n");
		assert(!result.isError);
		assertEquals(result.result, { primitive: true, type: "bigint", value: 123n });
	}
});
