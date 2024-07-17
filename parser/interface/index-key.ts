import { assert, assertEquals, assertObjectMatch } from "jsr:@std/assert@1.0.0";
import { optionalWhitespace, Parser, sequenceOf, str } from "npm:arcsecond";
import { identifier } from "../identifier.ts";
import { value, Value } from "../value/index.ts";
import { primitive } from "../value/primitive.ts";
import { assertParser } from "../utils.ts";

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
	assertParser(indexKey, "[key: string]", {
		type: "index-key",
		name: "key",
		indexType: { primitive: true, type: "string", value: null },
	});
});
