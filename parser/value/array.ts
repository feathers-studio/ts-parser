import { choice, many1, Parser, sequenceOf } from "npm:arcsecond";
import { wss, maybeBracketed, wsed, bracketed, assertParser } from "../utils.ts";
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
	assertParser(arrayValue, "string[]", {
		type: "array",
		value: { primitive: true, type: "string", value: null },
	});
});

Deno.test("arrayValue: 2", () => {
	assertParser(arrayValue, "(string | number)[]", {
		type: "array",
		value: {
			type: "union",
			options: [
				{ primitive: true, type: "string", value: null },
				{ primitive: true, type: "number", value: null },
			],
		},
	});
});

Deno.test("arrayValue: 3", () => {
	assertParser(arrayValue, "(string | number)[][]", {
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
	});
});
