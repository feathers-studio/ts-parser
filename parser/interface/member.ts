import { char, choice, many, optionalWhitespace, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { docString, DocString } from "../docString.ts";
import { identifier, Identifier } from "../identifier.ts";
import { indexKey, IndexKey } from "./index-key.ts";
import { value, Value } from "../value/index.ts";
import { assertParser } from "../utils.ts";

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
	assertParser(interfaceMember, "readonly public  [property: string]: string | number | null | undefined;", {
		type: "member",
		doc: null,
		modifier: ["readonly", "public"],
		name: {
			type: "index-key",
			name: "property",
			indexType: { primitive: true, type: "string", value: null },
		},
		optional: false,
		defn: {
			type: "union",
			options: [
				{ primitive: true, type: "string", value: null },
				{ primitive: true, type: "number", value: null },
				{ primitive: true, type: "null" },
				{ primitive: true, type: "undefined" },
			],
		},
	});
});

Deno.test("interfaceMember: 2", () => {
	assertParser(interfaceMember, "readonly   hello ? : World;", {
		type: "member",
		doc: null,
		modifier: ["readonly"],
		name: { type: "identifier", value: "hello" },
		optional: true,
		defn: { type: "identifier", value: "World" },
	});
});

Deno.test("interfaceMember: 3", () => {
	assertParser(interfaceMember, "readonly public  hello : World;", {
		type: "member",
		doc: null,
		modifier: ["readonly", "public"],
		name: { type: "identifier", value: "hello" },
		optional: false,
		defn: { type: "identifier", value: "World" },
	});
});

Deno.test("interfaceMember: 4", () => {
	assertParser(interfaceMember, 'readonly  protected  [ hello: string ] : "World";', {
		type: "member",
		doc: null,
		modifier: ["readonly", "protected"],
		name: {
			type: "index-key",
			name: "hello",
			indexType: { primitive: true, type: "string", value: null },
		},
		optional: false,
		defn: { primitive: true, type: "string", value: "World" },
	});
});
