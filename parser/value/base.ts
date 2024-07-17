import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { choice, Parser } from "npm:arcsecond";
import { identifier, Identifier } from "../identifier.ts";
import { primitive, Primitive } from "./primitive.ts";
import { maybeBracketed } from "../utils.ts";

export type PrimitiveOrId = Primitive | Identifier;

export const primitiveOrId: Parser<PrimitiveOrId> = //
	maybeBracketed(choice([primitive, identifier]));

Deno.test("primitiveOrId: 1", () => {
	const result = primitiveOrId.run("string");
	assert(!result.isError);
	assertEquals(result.result, { primitive: true, type: "string", value: null });
});

Deno.test("primitiveOrId: 2", () => {
	const result = primitiveOrId.run("String");
	assert(!result.isError);
	assertEquals(result.result, { type: "identifier", value: "String" });
});
