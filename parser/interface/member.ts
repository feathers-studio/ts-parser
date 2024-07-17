import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { char, choice, many, optionalWhitespace, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { docString, DocString } from "../docString.ts";
import { identifier, Identifier } from "../identifier.ts";
import { indexKey, IndexKey } from "./index-key.ts";
import { value, Value } from "../value/index.ts";

export type Modifier = "readonly" | "public" | "private" | "protected";

export interface InterfaceMember {
	type: "member";
	doc: DocString | null;
	modifier: Modifier[];
	name: Identifier | IndexKey;
	optional: boolean;
	defn: Value;
}

export const interfaceMember: Parser<InterfaceMember> = sequenceOf([
	optionalWhitespace,
	possibly(docString),
	many(
		sequenceOf([choice([str("readonly"), str("public"), str("private"), str("protected")]), whitespace])
			// we don't care about the whitespace
			.map(([v]) => v as Modifier),
	),
	optionalWhitespace,
	choice([identifier, indexKey]),
	optionalWhitespace,
	possibly(char("?")).map(c => c != null),
	optionalWhitespace,
	str(":"),
	optionalWhitespace,
	value,
	optionalWhitespace,
	str(";"),
	optionalWhitespace,
] as const).map(
	(
		[_, doc, modifier, __, name, ___, optional, ____, _____, ______, defn], //
	) => ({ type: "member", doc, modifier, name, optional, defn }),
);

Deno.test("interfaceMember: 1", () => {
	const result = interfaceMember.run("[property: string]: string | number | null | undefined;");
	assert(!result.isError);
	assertEquals(result.result.type, "member");
	assertEquals(result.result.doc, null);
	assertEquals(result.result.modifier, []);
	assertEquals(result.result.name, {
		type: "index-key",
		name: "property",
		indexType: { primitive: true, type: "string", value: null },
	});
	assertEquals(result.result.optional, false);
	assertEquals(result.result.defn, {
		type: "union",
		options: [
			{ primitive: true, type: "string", value: null },
			{ primitive: true, type: "number", value: null },
			{ primitive: true, type: "null" },
			{ primitive: true, type: "undefined" },
		],
	});
});

Deno.test("interfaceMember: 2", () => {
	const result = interfaceMember.run("readonly   hello ? : World;");
	assert(!result.isError);
	assertEquals(result.result.type, "member");
	assertEquals(result.result.doc, null);
	assertEquals(result.result.modifier, ["readonly"]);
	assertEquals(result.result.name, { type: "identifier", value: "hello" });
	assertEquals(result.result.optional, true);
	assertEquals(result.result.defn, { type: "identifier", value: "World" });
});

Deno.test("interfaceMember: 3", () => {
	const result = interfaceMember.run("readonly public  hello : World;");
	assert(!result.isError);
	assertEquals(result.result.type, "member");
	assertEquals(result.result.doc, null);
	assertEquals(result.result.modifier, ["readonly", "public"]);
	assertEquals(result.result.name, { type: "identifier", value: "hello" });
	assertEquals(result.result.optional, false);
	assertEquals(result.result.defn, { type: "identifier", value: "World" });
});

Deno.test("interfaceMember: 4", () => {
	const result = interfaceMember.run('readonly  protected  [ hello: string ] : "World";');
	assert(!result.isError);
	assertEquals(result.result.type, "member");
	assertEquals(result.result.doc, null);
	assertEquals(result.result.modifier, ["readonly", "protected"]);
	assertEquals(result.result.name, {
		type: "index-key",
		name: "hello",
		indexType: { primitive: true, type: "string", value: null },
	});
	assertEquals(result.result.optional, false);
	assertEquals(result.result.defn, { primitive: true, type: "string", value: "World" });
});
