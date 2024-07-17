import { assert, assertObjectMatch } from "jsr:@std/assert@1.0.0";
import { type PrimitiveOrId, primitiveOrId } from "./base.ts";
import { TupleValue, tupleValue } from "./tuple.ts";
import { UnionValue, unionValue } from "./union.ts";
import { ArrayValue, arrayValue } from "./array.ts";
import { choice, Parser } from "npm:arcsecond";
import { ends } from "../utils.ts";

export type Value = UnionValue | TupleValue | ArrayValue | PrimitiveOrId;

export const value: Parser<Value> = choice([unionValue, tupleValue, arrayValue, primitiveOrId]);

Deno.test("value: 1", () => {
	const result = ends(value).run("string");

	assertObjectMatch(result, {
		isError: false,
		result: { primitive: true, type: "string", value: null },
	});
});

Deno.test("value: 2", () => {
	const result = ends(value).run("string | number");

	assertObjectMatch(result, {
		isError: false,
		result: {
			type: "union",
			options: [
				{ primitive: true, type: "string", value: null },
				{ primitive: true, type: "number", value: null },
			],
		},
	});
});

Deno.test("value: 3", () => {
	const result = ends(value).run("[string, number]");

	assertObjectMatch(result, {
		isError: false,
		result: {
			type: "tuple",
			values: [
				{ primitive: true, type: "string", value: null },
				{ primitive: true, type: "number", value: null },
			],
		},
	});
});

Deno.test("value: 4", () => {
	const result = ends(value).run("string[]");

	assertObjectMatch(result, {
		isError: false,
		result: {
			type: "array",
			value: { primitive: true, type: "string", value: null },
		},
	});
});

Deno.test("value: 5", () => {
	const result = ends(value).run("(string | number)[]");

	assertObjectMatch(result, {
		isError: false,
		result: {
			type: "array",
			value: {
				type: "union",
				options: [
					{ primitive: true, type: "string", value: null },
					{ primitive: true, type: "number", value: null },
				],
			},
		},
	});
});

Deno.test("value: 6", () => {
	const result = ends(value).run("(string | number)[][]");

	assertObjectMatch(result, {
		isError: false,
		result: {
			type: "array",
			value: {
				type: "array",
				value: {
					type: "union",
					options: [
						{ primitive: true, type: "string", value: null },
						{ primitive: true, type: "number", value: null },
					],
				},
			},
		},
	});
});

Deno.test("value: 7", () => {
	const result = ends(value).run("string[][]");

	assertObjectMatch(result, {
		isError: false,
		result: {
			type: "array",
			value: {
				type: "array",
				value: { primitive: true, type: "string", value: null },
			},
		},
	});
});

Deno.test("value: 8", () => {
	const result = ends(value).run("string | number | null");

	assertObjectMatch(result, {
		isError: false,
		result: {
			type: "union",
			options: [
				{ primitive: true, type: "string", value: null },
				{ primitive: true, type: "number", value: null },
				{ primitive: true, type: "null" },
			],
		},
	});
});

Deno.test("value: 9", () => {
	const result = ends(value).run("string | number x[][]");
	assert(result.isError);
});

Deno.test("value: 10", () => {
	const result = ends(value).run("string | number[] x");
	assert(result.isError);
});
