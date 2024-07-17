import { assert, assertEquals } from "jsr:@std/assert@1.0.0";

import {
	Parser,
	between,
	str,
	many,
	char,
	sequenceOf,
	choice,
	letter,
	digit,
	possibly,
	whitespace,
	many1,
	everyCharUntil,
	sepBy,
	sepBy1,
	digits,
} from "npm:arcsecond";

function nonNull<T>(value: T | null): value is T {
	return value != null;
}

// updateError :: (ParserState e a s, f) -> ParserState f a s
const updateError = (state: { isError: boolean; error: string }, error: string) =>
	Object.assign(Object.assign({}, state), { isError: true, error });

// sepByN :: (Parser e a s, n) -> Parser e b s -> Parser e [b] s
const sepByN = <Sep, V>(sepParser: Parser<Sep>, n: number) => {
	return function sepByN$valParser(valueParser: Parser<V>): Parser<V[]> {
		return new Parser(function sepByN$valParser$state(state: any) {
			if (state.isError) return state;
			const out = sepBy(sepParser)(valueParser).p(state);
			if (out.isError) return out;
			if (out.result.length < n) {
				return updateError(
					state,
					`ParseError 'sepByN' (position ${state.index}): Expecting to match at least ${n} separated value`,
				);
			}
			return out;
		});
	};
};

const bw =
	<A extends Parser<unknown>, B extends Parser<unknown>>(a: A, b?: B) =>
	<C extends Parser<unknown> = Parser<string>>(consume?: C) =>
		between(a)(b ?? a)(consume ?? everyCharUntil(b ?? a)) as C;

const quoted: Parser<string> = bw(str('"'))();

Deno.test("quoted", () => {
	const result = quoted.run('"Hello, World!"');
	assert(!result.isError);
	assertEquals(result.result, "Hello, World!");
});

interface Reference {
	type: "reference";
	path: string;
}

/* /// <reference path="./iterable.d.ts" /> */
const reference: Parser<Reference> = bw(
	str("/// <reference path="),
	str(" />"),
)(quoted).map(path => ({ type: "reference", path }));

Deno.test("reference", () => {
	const result = reference.run('/// <reference path="./iterable.d.ts" />');
	assert(!result.isError);
	assertEquals(result.result.type, "reference");
	assertEquals(result.result.path, "./iterable.d.ts");
});

interface Comment {
	type: "comment";
	text: string;
	multi: boolean;
}

const comment: {
	single: Parser<Comment>;
	multi: Parser<Comment>;
} = {
	single: bw(str("//"), str("\n"))().map(text => ({ type: "comment", text, multi: false })),
	multi: bw(str("/*"), str("*/"))().map(text => ({ type: "comment", text, multi: true })),
};

const anyComment: Parser<Comment> = choice([comment.single, comment.multi]);

Deno.test("comment.single", () => {
	const result = comment.single.run("// Hello, World!\n");
	assert(!result.isError);
	assertEquals(result.result.type, "comment");
	assertEquals(result.result.text, " Hello, World!");
	assertEquals(result.result.multi, false);
});

Deno.test("comment.multi", () => {
	const result = comment.multi.run(`/* Hello, many\n worlds! */`);
	assert(!result.isError);
	assertEquals(result.result.type, "comment");
	assertEquals(result.result.text, " Hello, many\n worlds! ");
	assertEquals(result.result.multi, true);
});

Deno.test("anyComment:single", () => {
	const result = anyComment.run("// Hello, World!\n");
	assert(!result.isError);
	assertEquals(result.result.type, "comment");
	assertEquals(result.result.text, " Hello, World!");
	assertEquals(result.result.multi, false);
});

Deno.test("anyComment:multi", () => {
	const result = comment.multi.run(`/* Hello, many\n worlds! */`);
	assert(!result.isError);
	assertEquals(result.result.type, "comment");
	assertEquals(result.result.text, " Hello, many\n worlds! ");
	assertEquals(result.result.multi, true);
});

interface DocString {
	type: "docString";
	doc: string;
}

const docString: Parser<DocString> = bw(str("/**"), str("*/"))().map(doc => ({ type: "docString", doc }));

Deno.test("docString", () => {
	const result = docString.run("/** Hello, World! */");
	assert(!result.isError);
	assertEquals(result.result.type, "docString");
	assertEquals(result.result.doc, " Hello, World! ");
});

// "(_|$|[a-zA-Z])(_|$|[a-zA-Z0-9])+";
const nonDigit = choice([str("_"), str("$"), letter]);

interface Identifier {
	type: "identifier";
	value: string;
}

const identifier: Parser<Identifier> = //
	sequenceOf([nonDigit, many(choice([nonDigit, digit])).map(chars => chars.join(""))])
		.map(([n, d]) => n + d)
		.map(str => ({ type: "identifier", value: str }));

Deno.test("identifier", () => {
	{
		const result = identifier.run("helloWorld");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld" });
	}

	{
		const result = identifier.run("_helloWorld");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "_helloWorld" });
	}

	{
		const result = identifier.run("$helloWorld");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "$helloWorld" });
	}

	{
		const result = identifier.run("_$helloWorld");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "_$helloWorld" });
	}

	{
		const result = identifier.run("helloWorld_");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld_" });
	}

	{
		const result = identifier.run("helloWorld$");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld$" });
	}

	{
		const result = identifier.run("helloWorld0");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld0" });
	}

	{
		const result = identifier.run("helloWorld_0");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld_0" });
	}

	{
		const result = identifier.run("helloWorld$0");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld$0" });
	}

	{
		const result = identifier.run("helloWorld_0$");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld_0$" });
	}

	{
		const result = identifier.run("helloWorld$0_");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld$0_" });
	}

	{
		const result = identifier.run("0helloWorld");
		assert(result.isError);
	}

	{
		const result = identifier.run("-");
		assert(result.isError);
	}
});

declare namespace Primitive {
	interface String {
		type: "string";
		value: string;
	}

	interface Number {
		type: "number";
		value: number;
	}

	interface Boolean {
		type: "boolean";
		value: boolean | null;
	}
}

type Primitive = Primitive.String | Primitive.Number | Primitive.Boolean;

const string: Parser<Primitive.String> = bw(str('"'), str('"'))() //
	.map(value => ({ type: "string", value }));

const number: Parser<Primitive.Number> = digits
	.map(chars => parseInt(chars, 10))
	.map(value => ({ type: "number", value }));

const boolean: Parser<Primitive.Boolean> = choice([str("true"), str("false"), str("boolean")])
	.map(str => (str === "boolean" ? null : str === "true"))
	.map(value => ({ type: "boolean", value }));

const primitive: Parser<Primitive> = choice([string, number, boolean]);

Deno.test("primitive:string", () => {
	const result = string.run('"Hello, World!"');
	assert(!result.isError);
	assertEquals(result.result, { type: "string", value: "Hello, World!" });
});

Deno.test("primitive:number", () => {
	const result = number.run("123");
	assert(!result.isError);
	assertEquals(result.result, { type: "number", value: 123 });
});

Deno.test("primitive:boolean", () => {
	const result = boolean.run("false");
	assert(!result.isError);
	assertEquals(result.result, { type: "boolean", value: false });
});

Deno.test("primitive", () => {
	{
		const result = primitive.run('"Hello, World!"');
		assert(!result.isError);
		assertEquals(result.result, { type: "string", value: "Hello, World!" });
	}

	{
		const result = primitive.run("123");
		assert(!result.isError);
		assertEquals(result.result, { type: "number", value: 123 });
	}

	{
		const result = primitive.run("false");
		assert(!result.isError);
		assertEquals(result.result, { type: "boolean", value: false });
	}
});

type Intersperse<Ps extends unknown[], S> = Ps extends [infer A, ...infer B]
	? B extends []
		? [A]
		: [A, S, ...Intersperse<B, S>]
	: Ps;

interface IndexKey {
	type: "index-key";
	name: string;
	indexType: Identifier;
}

const indexKey: Parser<IndexKey> = sequenceOf([
	str("["),
	many(whitespace),
	identifier,
	many(whitespace),
	str(":"),
	many(whitespace),
	identifier,
	many(whitespace),
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
	assertEquals(result.result.indexType, { type: "identifier", value: "string" });
});

const identifierOrPrimitive: Parser<Identifier | Primitive> = choice([primitive, identifier]);
const unionSep: Parser<null> = sequenceOf([many(whitespace), str("|"), many(whitespace)]).map(() => null);

interface UnionValue {
	type: "union";
	types: (Primitive | Identifier)[];
}

const unionValue: Parser<UnionValue> = sepByN<null, Identifier | Primitive>(
	unionSep,
	2,
)(identifierOrPrimitive).map(types => ({ type: "union", types }));

type InterfaceValue = Primitive | Identifier | UnionValue;

const interfaceValue: Parser<InterfaceValue> = choice([unionValue, identifierOrPrimitive]);

Deno.test("interfaceValue", () => {
	{
		const result = interfaceValue.run("World");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "World" });
	}

	{
		const result = interfaceValue.run('"World"');
		assert(!result.isError);
		assertEquals(result.result, { type: "string", value: "World" });
	}

	{
		const result = interfaceValue.run("World | string");
		assert(!result.isError);
		assertEquals(result.result, {
			type: "union",
			types: [
				{ type: "identifier", value: "World" },
				{ type: "identifier", value: "string" },
			],
		});
	}

	{
		const result = interfaceValue.run("false | string");
		assert(!result.isError);
		assertEquals(result.result, {
			type: "union",
			types: [
				{ type: "boolean", value: false },
				{ type: "identifier", value: "string" },
			],
		});
	}
});

type Modifier = "readonly" | "public" | "private" | "protected";

interface InterfaceMember {
	type: "member";
	doc: DocString | null;
	modifier: Modifier[];
	name: Identifier | IndexKey;
	optional: boolean;
	defn: InterfaceValue;
}

const interfaceMember: Parser<InterfaceMember> = sequenceOf([
	possibly(many(whitespace)),
	possibly(docString),
	many(
		sequenceOf([choice([str("readonly"), str("public"), str("private"), str("protected")]), whitespace])
			// we don't care about the whitespace
			.map(([v]) => v as Modifier),
	),
	many(whitespace),
	choice([identifier, indexKey]),
	many(whitespace),
	possibly(char("?")).map(c => c != null),
	many(whitespace),
	str(":"),
	many(whitespace),
	interfaceValue,
	many(whitespace),
	str(";"),
	possibly(many(whitespace)),
] as const).map(
	(
		[_, doc, modifier, __, name, ___, optional, ____, _____, ______, defn], //
	) => ({ type: "member", doc, modifier, name, optional, defn }),
);

Deno.test("interfaceMember", () => {
	{
		const result = interfaceMember.run("readonly   hello ? : World;");
		assert(!result.isError);
		assertEquals(result.result.type, "member");
		assertEquals(result.result.doc, null);
		assertEquals(result.result.modifier, ["readonly"]);
		assertEquals(result.result.name, { type: "identifier", value: "hello" });
		assertEquals(result.result.optional, true);
		assertEquals(result.result.defn, { type: "identifier", value: "World" });
	}

	{
		const result = interfaceMember.run('readonly public  hello : "World";');
		assert(!result.isError);
		assertEquals(result.result.type, "member");
		assertEquals(result.result.doc, null);
		assertEquals(result.result.modifier, ["readonly", "public"]);
		assertEquals(result.result.name, { type: "identifier", value: "hello" });
		assertEquals(result.result.optional, false);
		assertEquals(result.result.defn, { type: "string", value: "World" });
	}

	{
		const result = interfaceMember.run('readonly  protected  [ hello: string ] : "World";');
		assert(!result.isError);
		assertEquals(result.result.type, "member");
		assertEquals(result.result.doc, null);
		assertEquals(result.result.modifier, ["readonly", "protected"]);
		assertEquals(result.result.name, {
			type: "index-key",
			name: "hello",
			indexType: { type: "identifier", value: "string" },
		});
		assertEquals(result.result.optional, false);
		assertEquals(result.result.defn, { type: "string", value: "World" });
	}
});

const interfaceExtends: Parser<Identifier> = sequenceOf([str("extends"), many1(whitespace), identifier]).map(
	([_, __, id]) => id,
);

Deno.test("interfaceExtends", () => {
	const result = interfaceExtends.run("extends  B");
	assert(!result.isError);
	assertEquals(result.result, { type: "identifier", value: "B" });
});

interface InterfaceHeader {
	type: "interface-header";
	name: string;
	extends: string | null;
}

const interfaceHeader: Parser<InterfaceHeader> = sequenceOf([
	str("interface"),
	many1(whitespace),
	identifier.map(id => id.value),
	possibly(sequenceOf([many1(whitespace), interfaceExtends.map(id => id.value)]).map(([_, ext]) => ext)),
]).map(([_, __, name, ext]) => ({ type: "interface-header", name, extends: ext }));

Deno.test("interfaceHeader", () => {
	{
		const result = interfaceHeader.run("interface A");
		assert(!result.isError);
		assertEquals(result.result.type, "interface-header");
		assertEquals(result.result.name, "A");
	}

	{
		const result = interfaceHeader.run("interface A extends  B");
		assert(!result.isError);
		assertEquals(result.result.type, "interface-header");
		assertEquals(result.result.name, "A");
		assertEquals(result.result.extends, "B");
	}
});

interface Interface {
	type: "interface";
	doc: DocString | null;
	name: string;
	extends: string | null;
	members: InterfaceMember[];
}

const iface: Parser<Interface> = sequenceOf([
	possibly(docString),
	many(whitespace),
	interfaceHeader,
	many(whitespace),
	bw(str("{"), str("}"))(many(interfaceMember)),
]).map(([doc, _, header, __, members]) => ({
	type: "interface",
	doc,
	name: header.name,
	extends: header.extends,
	members,
}));

Deno.test("iface", () => {
	{
		const result = iface.run(`interface Hello extends World {
		readonly hello ? : World;
		readonly hello : "World";
	}`);
		assert(!result.isError);
		assertEquals(result.result.type, "interface");
		assertEquals(result.result.name, "Hello");
		assertEquals(result.result.extends, "World");
		assertEquals(result.result.members.length, 2);
	}

	{
		const result = iface.run(`interface Hello {
		readonly hello ? : World;
		readonly hello : "World";
	}`);
		assert(!result.isError);
		assertEquals(result.result.type, "interface");
		assertEquals(result.result.name, "Hello");
		assertEquals(result.result.extends, null);
		assertEquals(result.result.members.length, 2);
	}
});

const ws = whitespace.map(() => null);

const FileHeader = many(choice([reference, ws, anyComment])) //
	.map(defs => defs.filter(nonNull));

const TypeScriptDefinitionFile = sequenceOf([FileHeader, many(choice([ws, anyComment, iface]))]) //
	.map(stuff => stuff.flat().filter(nonNull));

const parse = (lib: string) => TypeScriptDefinitionFile.run(lib);

Deno.test("parse", () => {
	const result = parse(`
/// <reference path="./iterable.d.ts" />

/////////////////////////////
/// Window APIs
/////////////////////////////

interface AddEventListenerOptions extends EventListenerOptions {
	once?: boolean;
	passive?: boolean;
	signal?: AbortSignal;
}

interface ComputedKeyframe {
	composite: CompositeOperationOrAuto;
	computedOffset: number;
	easing: string;
	offset: number | null;
	[property: string]: string | number | null | undefined;
}
`);

	console.log(result);

	assert(!result.isError);
	assertEquals(result.result.length, 6);
});

/* missing:

Interface type params

[ ] null value
[ ] Array value
[x] "boolean" value (it can be "true" or "false" or "boolean")
[ ] declare var
[ ] declare function
[ ] type

*/
