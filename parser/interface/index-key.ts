import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { optionalWhitespace, Parser, sequenceOf, str } from "npm:arcsecond";
import { identifier } from "../identifier.ts";
import { value, Value } from "../value/index.ts";

export interface IndexKey {
	type: "index-key";
	name: string;
	indexType: Value;
}

export const indexKey: Parser<IndexKey> = sequenceOf([
	str("["),
	optionalWhitespace,
	identifier,
	optionalWhitespace,
	str(":"),
	optionalWhitespace,
	value,
	optionalWhitespace,
	str("]"),
]).map(
	(
		[_, __, name, ___, ____, _____, indexType], //
	) => ({ type: "index-key", name: name.value, indexType }),
);

Deno.test("indexSignature", () => {
	const result = indexKey.run("[key: string]");
	assert(!result.isError);
	assertEquals(result.result.type, "index-key");
	assertEquals(result.result.name, "key");
	assertEquals(result.result.indexType, { primitive: true, type: "string", value: null });
});
