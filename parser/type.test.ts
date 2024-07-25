import { assertParser, assertParserFails } from "./utils.ts";
import { Type, Member, IndexKey, ObjectType, TupleType } from "./type.ts";
import { TypeReference } from "./type.ts";
import { QualifiedName } from "./type.ts";
import { ArrayType } from "./type.ts";
import { IntersectionType } from "./type.ts";
import { UnionType } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";
import { Predefined } from "./predefined.ts";

Deno.test("Index Key", () => {
	assertParser(IndexKey.parser, "[key: string]", new IndexKey("key", new Predefined.String()));
});

Deno.test("Member: 1", () => {
	assertParser(
		Member.parser,
		" [ property :   string]  :   string",
		new Member(new IndexKey("property", new Predefined.String()), new Predefined.String(), {
			doc: null,
			modifier: [],
			optional: false,
		}),
	);
});

Deno.test("Member: 2", () => {
	assertParser(
		Member.parser,
		"readonly   hello ? : World",
		new Member(new Identifier("hello"), new TypeReference(new Identifier("World")), {
			doc: null,
			modifier: ["readonly"],
			optional: true,
		}),
	);
});

Deno.test("Member: 3", () => {
	assertParser(
		Member.parser,
		"readonly public  hello : World.Rivers.Amazon",
		new Member(
			new Identifier("hello"),
			new TypeReference(
				new QualifiedName(
					new QualifiedName(new Identifier("World"), new Identifier("Rivers")),
					new Identifier("Amazon"),
				),
			),
			{ doc: null, modifier: ["readonly", "public"], optional: false },
		),
	);
});

Deno.test("Member: 4", () => {
	assertParser(
		Member.parser,
		'readonly  protected  [ hello: string ] : "World"',
		new Member(new IndexKey("hello", new Predefined.String()), new Literal.String("World"), {
			doc: null,
			modifier: ["readonly", "protected"],
			optional: false,
		}),
	);
});

Deno.test("Member: 5", () => {
	assertParser(
		Member.parser,
		"readonly public  hello ? : World<Rivers, Amazon>",
		new Member(
			new Identifier("hello"),
			new TypeReference(new Identifier("World"), [
				new TypeReference(new Identifier("Rivers")),
				new TypeReference(new Identifier("Amazon")),
			]),
			{ doc: null, modifier: ["readonly", "public"], optional: true },
		),
	);
});

Deno.test("PrimitiveType: string", () => {
	assertParser(Type, '"Hello, World!"', new Literal.String("Hello, World!"));
});

Deno.test("PrimitiveType: number", () => {
	assertParser(Type, "123", new Literal.Number(123));
});

Deno.test("Primitive: boolean", () => {
	assertParser(Type, "true", new Literal.Boolean(true));
});

Deno.test("Primitive: null", () => {
	assertParser(Type, "null", new Literal.Null());
});

Deno.test("Primitive: undefined", () => {
	assertParser(Type, "undefined", new Literal.Undefined());
});

Deno.test("Primitive: symbol", () => {
	assertParser(Type, "symbol", new Literal.SymbolType(false));
});

Deno.test("Primitive: bigint", () => {
	assertParser(Type, "123n", new Literal.BigIntType(123n));
});

Deno.test("PredefinedType: string", () => {
	assertParser(Type, "string", new Predefined.String());
});

Deno.test("PredefinedType: any", () => {
	assertParser(Type, "any", new Predefined.Any());
});

Deno.test("PredefinedType: number", () => {
	assertParser(Type, "number", new Predefined.Number());
});

Deno.test("PredefinedType: boolean", () => {
	assertParser(Type, "boolean", new Predefined.Boolean());
});

Deno.test("PredefinedType: bigint", () => {
	assertParser(Type, "bigint", new Predefined.BigInt());
});

Deno.test("PredefinedType: void", () => {
	assertParser(Type, "void", new Predefined.Void());
});

Deno.test("PredefinedType: never", () => {
	assertParser(Type, "never", new Predefined.Never());
});

Deno.test("Array of PredefinedType: string", () => {
	assertParser(Type, "string[]", new ArrayType(new Predefined.String()));
});

Deno.test("Array of Array of PredefinedType: string", () => {
	assertParser(Type, "string[][]", new ArrayType(new ArrayType(new Predefined.String())));
});

Deno.test("Parenthesised PredefinedType: null", () => {
	assertParser(Type, "(null)", new Literal.Null());
});

Deno.test("Parenthesised Array of PredefinedType: string", () => {
	assertParser(Type, "(string[])", new ArrayType(new Predefined.String()));
});

Deno.test("Tuple (empty)", () => {
	assertParser(Type, "[]", new TupleType([]));
});

Deno.test("Tuple of PredefinedType: string", () => {
	assertParser(Type, "[string]", new TupleType([new Predefined.String()]));
});

Deno.test("Tuple of two PredefinedTypes: string, number", () => {
	assertParser(Type, "[string, number]", new TupleType([new Predefined.String(), new Predefined.Number()]));
});

Deno.test("TypeReference (Simple)", () => {
	assertParser(Type, "String", new TypeReference(new Identifier("String")));
});

Deno.test("TypeReference with a single TypeParameter", () => {
	assertParser(Type, "String<number>", new TypeReference(new Identifier("String"), [new Predefined.Number()]));
});

Deno.test("TypeReference with multiple TypeParameters", () => {
	assertParser(
		Type,
		"String<number, string>",
		new TypeReference(new Identifier("String"), [new Predefined.Number(), new Predefined.String()]),
	);
});

Deno.test("TypeReference with Namespaces and nested TypeParameters", () => {
	assertParser(
		Type,
		"S.P.Q.R<A.B.C.D, F<string>, string>",
		new TypeReference(
			new QualifiedName(
				new QualifiedName(new QualifiedName(new Identifier("S"), new Identifier("P")), new Identifier("Q")),
				new Identifier("R"),
			),
			[
				new TypeReference(
					new QualifiedName(
						new QualifiedName(
							new QualifiedName(new Identifier("A"), new Identifier("B")),
							new Identifier("C"),
						),
						new Identifier("D"),
					),
				),
				new TypeReference(new Identifier("F"), [new Predefined.String()]),
				new Predefined.String(),
			],
		),
	);
});

Deno.test("Parenthesised Array of TypeReferences with TypeParameter", () => {
	assertParser(
		Type,
		"(String<number>[])[]",
		new ArrayType(new ArrayType(new TypeReference(new Identifier("String"), [new Predefined.Number()]))),
	);
});

Deno.test("Union of PredefinedTypes: string, number", () => {
	assertParser(Type, "string | number", new UnionType([new Predefined.String(), new Predefined.Number()]));
});

Deno.test("Union of string and number[]", () => {
	assertParser(
		Type,
		"(string | number)[]",
		new ArrayType(new UnionType([new Predefined.String(), new Predefined.Number()])),
	);
});

Deno.test("Array of Array of Union of string and number", () => {
	assertParser(
		Type,
		"(string | number)[][]",
		new ArrayType(new ArrayType(new UnionType([new Predefined.String(), new Predefined.Number()]))),
	);
});

Deno.test("Union of string, number and null", () => {
	assertParser(
		Type,
		"string | number | null",
		new UnionType([new Predefined.String(), new UnionType([new Predefined.Number(), new Literal.Null()])]),
	);
});

Deno.test("Object with Parenthesis and Arrays", () => {
	assertParser(
		Type,
		"({ key: string; key2: number[] })",
		new ObjectType([
			new Member(new Identifier("key"), new Predefined.String(), { doc: null, modifier: [], optional: false }),
			new Member(new Identifier("key2"), new ArrayType(new Predefined.Number()), {
				doc: null,
				modifier: [],
				optional: false,
			}),
		]),
	);
});

Deno.test("Intersection of TypeReferences", () => {
	assertParser(
		Type,
		"A & B & C",
		new IntersectionType([
			new TypeReference(new Identifier("A")),
			new IntersectionType([new TypeReference(new Identifier("B")), new TypeReference(new Identifier("C"))]),
		]),
	);
});

Deno.test("Union of Intersection of TypeReferences", () => {
	assertParser(
		Type,
		"A & B | C & D",
		new UnionType([
			new IntersectionType([new TypeReference(new Identifier("A")), new TypeReference(new Identifier("B"))]),
			new IntersectionType([new TypeReference(new Identifier("C")), new TypeReference(new Identifier("D"))]),
		]),
	);
});

Deno.test("Union of Intersection of TypeReferences (Parenthesised)", () => {
	assertParser(
		Type,
		"A & (B | C) & D",
		new IntersectionType([
			new TypeReference(new Identifier("A")),
			new IntersectionType([
				new UnionType([new TypeReference(new Identifier("B")), new TypeReference(new Identifier("C"))]),
				new TypeReference(new Identifier("D")),
			]),
		]),
	);
});

Deno.test("Object with Parenthesis and Arrays (2)", () => {
	assertParser(
		Type,
		"({ foo: (string[])[] })[][]",
		new ArrayType(
			new ArrayType(
				new ObjectType([
					new Member(new Identifier("foo"), new ArrayType(new ArrayType(new Predefined.String())), {
						doc: null,
						modifier: [],
						optional: false,
					}),
				]),
			),
		),
	);
});

Deno.test("Object (complex)", () => {
	assertParser(
		Type,
		'{ key: "value"; key2: { nestedKey: S.P.Q.R<X> }, [rest: string]: string }',
		new ObjectType([
			new Member(new Identifier("key"), new Literal.String("value"), {
				doc: null,
				modifier: [],
				optional: false,
			}),
			new Member(
				new Identifier("key2"),
				new ObjectType([
					new Member(
						new Identifier("nestedKey"),
						new TypeReference(
							new QualifiedName(
								new QualifiedName(
									new QualifiedName(new Identifier("S"), new Identifier("P")),
									new Identifier("Q"),
								),
								new Identifier("R"),
							),
							[new TypeReference(new Identifier("X"))],
						),
						{ doc: null, modifier: [], optional: false },
					),
				]),
				{ doc: null, modifier: [], optional: false },
			),
			new Member(new IndexKey("rest", new Predefined.String()), new Predefined.String(), {
				doc: null,
				modifier: [],
				optional: false,
			}),
		]),
	);
});

Deno.test("Invalid syntax", () => {
	assertParserFails(Type, "string | number x[][]");
});

Deno.test("Invalid syntax (2)", () => {
	assertParserFails(Type, "string | number[] x");
});
