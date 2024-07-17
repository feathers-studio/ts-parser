import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { Parser, str } from "npm:arcsecond";
import { sepByN, wsed } from "../utils.ts";
import { PrimitiveOrId, primitiveOrId } from "./base.ts";

const unionSep: Parser<null> = wsed(str("|")).map(() => null);

export interface UnionValue {
	type: "union";
	options: PrimitiveOrId[];
}

export const unionValue: Parser<UnionValue> = //
	sepByN<null, PrimitiveOrId>(
		unionSep,
		2,
	)(primitiveOrId) //
		.map(options => ({ type: "union", options }));

export type MaybeUnionPrimitiveOrId = PrimitiveOrId | UnionValue;

Deno.test("unionValue: 1", () => {
	const result = unionValue.run("string | number");
	assert(!result.isError);
	assertEquals(result.result.type, "union");

	for (const option of result.result.options) {
		assert("primitive" in option);
		assert(option.type === "string" || option.type === "number");
	}
});

Deno.test("unionValue: 2", () => {
	const result = unionValue.run("string | Number | null");
	assert(!result.isError);
	assertEquals(result.result.type, "union");

	for (const option of result.result.options) {
		if ("primitive" in option) {
			assert(option.type === "string" || option.type === "null");
		} else {
			assert(option.type === "identifier");
			assertEquals(option.value, "Number");
		}
	}
});
