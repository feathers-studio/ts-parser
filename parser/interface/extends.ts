import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { many1, Parser, sequenceOf, str, whitespace } from "npm:arcsecond";
import { identifier, Identifier } from "../identifier.ts";

export const interfaceExtends: Parser<Identifier> = sequenceOf([str("extends"), many1(whitespace), identifier]) //
	.map(([_, __, id]) => id);

Deno.test("interfaceExtends", () => {
	const result = interfaceExtends.run("extends  B");
	assert(!result.isError);
	assertEquals(result.result, { type: "identifier", value: "B" });
});
