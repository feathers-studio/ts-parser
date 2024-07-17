import { assertEquals } from "jsr:@std/assert@1.0.0";
import { choice, many1, Parser, sequenceOf } from "npm:arcsecond";
import { wss, maybeBracketed, wsed, bracketed, ends } from "../utils.ts";
import { unionValue, UnionValue } from "./union.ts";
import { tupleValue, TupleValue } from "./tuple.ts";
import { PrimitiveOrId, primitiveOrId } from "./base.ts";

export interface ArrayValue {
	type: "array";
	value: ArrayValue | UnionValue | TupleValue | PrimitiveOrId;
}

export const arrayValue: Parser<ArrayValue> = sequenceOf([
	wsed(maybeBracketed(wsed(choice([unionValue, tupleValue, primitiveOrId])), "(")),
	many1(wsed(bracketed(wss, "["))),
]) //
	.map(([value, brackets]) => {
		let result: ArrayValue | UnionValue | TupleValue | PrimitiveOrId = value;
		for (const _ of brackets) result = { type: "array", value: result };
		return result as ArrayValue;
	});

Deno.test("arrayValue: 1", () => {
	const source = "string [  ]";
	const result = ends(arrayValue).run(source);

	assertEquals(result, {
		isError: false,
		result: { type: "array", value: { primitive: true, type: "string", value: null } },
		index: source.length,
		data: null,
	});
});

Deno.test("arrayValue: 2", () => {
	const source = "( string | number  ) [ ]";
	const result = ends(arrayValue).run(source);

	assertEquals(result, {
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
		index: source.length,
		data: null,
	});
});

Deno.test("arrayValue: 3", () => {
	const source = "( string | number | null ) [ ] []";
	const result = ends(arrayValue).run(source);

	assertEquals(result, {
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
						{ primitive: true, type: "null" },
					],
				},
			},
		},
		index: source.length,
		data: null,
	});
});
