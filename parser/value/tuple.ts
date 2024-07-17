import { char, choice, Parser, sepBy } from "npm:arcsecond";
import { assertParser, bracketed, wsed } from "../utils.ts";

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
	assertParser(tupleValue, "[string]", {
		type: "tuple",
		values: [{ primitive: true, type: "string", value: null }],
	});
});

Deno.test("tupleValue: 2", () => {
	assertParser(tupleValue, "[string, number]", {
		type: "tuple",
		values: [
			{ primitive: true, type: "string", value: null },
			{ primitive: true, type: "number", value: null },
		],
	});
});
