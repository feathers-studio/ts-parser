import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { char, choice, Parser, sepBy, sequenceOf } from "npm:arcsecond";
import { bracketed, wsed } from "../utils.ts";

import { MaybeUnionPrimitiveOrId, unionValue } from "./union.ts";
import { primitiveOrId } from "./base.ts";

export interface TupleValue {
	type: "tuple";
	values: MaybeUnionPrimitiveOrId[];
}

export const tupleValue: Parser<TupleValue> = bracketed(
	sepBy<string, MaybeUnionPrimitiveOrId, string, unknown>(char(","))(wsed(choice([unionValue, primitiveOrId]))),
	"[",
).map(values => ({ type: "tuple", values }));

Deno.test("tupleValue: 1", () => {
	const result = tupleValue.run("[World, string]");
	assert(!result.isError);
	assertEquals(result.result.type, "tuple");

	for (const value of result.result.values) {
		assert("primitive" in value || value.type === "identifier" || value.type === "union");
	}
});

Deno.test("tupleValue: 2", () => {
	const result = tupleValue.run("[World | string]");
	assert(!result.isError);
	assertEquals(result.result.type, "tuple");

	for (const value of result.result.values) {
		assert("primitive" in value || value.type === "identifier" || value.type === "union");
	}
});
