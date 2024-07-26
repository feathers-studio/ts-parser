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
import { assertEquals } from "jsr:@std/assert@1.0.0/equals";

Deno.test("Index Key", () => {
	assertParser(IndexKey.parser, "[key: string]", new IndexKey("key", new Predefined.StringType()));
});

Deno.test("Member: 1", () => {
	assertParser(
		Member.parser,
		" [ property :   string]  :   string",
		new Member(new IndexKey("property", new Predefined.StringType()), new Predefined.StringType(), {
			doc: null,
			modifiers: [],
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
			modifiers: ["readonly"],
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
			{ doc: null, modifiers: ["readonly", "public"], optional: false },
		),
	);
});

Deno.test("Member: 4", () => {
	assertParser(
		Member.parser,
		'readonly  protected  [ hello: string ] : "World"',
		new Member(new IndexKey("hello", new Predefined.StringType()), new Literal.StringType("World"), {
			doc: null,
			modifiers: ["readonly", "protected"],
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
			{ doc: null, modifiers: ["readonly", "public"], optional: true },
		),
	);
});

Deno.test("PrimitiveType: string", () => {
	assertParser(Type, '"Hello, World!"', new Literal.StringType("Hello, World!"));
});

Deno.test("PrimitiveType: number", () => {
	assertParser(Type, "123", new Literal.NumberType(123));
});

Deno.test("PrimitiveType: number (negative)", () => {
	assertParser(Type, "-123", new Literal.NumberType(-123));
});

Deno.test("PrimitiveType: number (float)", () => {
	assertParser(Type, "123.456", new Literal.NumberType(123.456));
});

Deno.test("Primitive: boolean", () => {
	assertParser(Type, "true", new Literal.BooleanType(true));
});

Deno.test("Primitive: null", () => {
	assertParser(Type, "null", new Literal.NullType());
});

Deno.test("Primitive: undefined", () => {
	assertParser(Type, "undefined", new Literal.UndefinedType());
});

Deno.test("Primitive: symbol", () => {
	assertParser(Type, "symbol", new Literal.SymbolType(false));
});

Deno.test("Primitive: bigint", () => {
	assertParser(Type, "123n", new Literal.BigIntType(123n));
});

Deno.test("AST to source (string)", () => {
	assertEquals(new Literal.StringType("Hello, World!").toString(), '"Hello, World!"');
});

Deno.test("AST to source (number)", () => {
	assertEquals(new Literal.NumberType(123).toString(), "123");
});

Deno.test("AST to source (boolean)", () => {
	assertEquals(new Literal.BooleanType(true).toString(), "true");
});

Deno.test("AST to source (null)", () => {
	assertEquals(new Literal.NullType().toString(), "null");
});

Deno.test("AST to source (undefined)", () => {
	assertEquals(new Literal.UndefinedType().toString(), "undefined");
});

Deno.test("AST to source (symbol)", () => {
	assertEquals(new Literal.SymbolType(false).toString(), "symbol");
});

Deno.test("AST to source (bigint)", () => {
	assertEquals(new Literal.BigIntType(123n).toString(), "123n");
});

Deno.test("PredefinedType: string", () => {
	assertParser(Type, "string", new Predefined.StringType());
});

Deno.test("PredefinedType: any", () => {
	assertParser(Type, "any", new Predefined.AnyType());
});

Deno.test("PredefinedType: number", () => {
	assertParser(Type, "number", new Predefined.NumberType());
});

Deno.test("PredefinedType: boolean", () => {
	assertParser(Type, "boolean", new Predefined.BooleanType());
});

Deno.test("PredefinedType: bigint", () => {
	assertParser(Type, "bigint", new Predefined.BigIntType());
});

Deno.test("PredefinedType: void", () => {
	assertParser(Type, "void", new Predefined.VoidType());
});

Deno.test("PredefinedType: never", () => {
	assertParser(Type, "never", new Predefined.NeverType());
});

Deno.test("PredefinedType: unique symbol", () => {
	assertParser(Type, "never", new Predefined.NeverType());
});

Deno.test("AST to source (Predefined string)", () => {
	assertEquals(new Predefined.StringType().toString(), "string");
});

Deno.test("AST to source (Predefined any)", () => {
	assertEquals(new Predefined.AnyType().toString(), "any");
});

Deno.test("AST to source (Predefined number)", () => {
	assertEquals(new Predefined.NumberType().toString(), "number");
});

Deno.test("AST to source (Predefined boolean)", () => {
	assertEquals(new Predefined.BooleanType().toString(), "boolean");
});

Deno.test("AST to source (Predefined bigint)", () => {
	assertEquals(new Predefined.BigIntType().toString(), "bigint");
});

Deno.test("AST to source (Predefined void)", () => {
	assertEquals(new Predefined.VoidType().toString(), "void");
});

Deno.test("AST to source (Predefined never)", () => {
	assertEquals(new Predefined.NeverType().toString(), "never");
});

Deno.test("Array of PredefinedType: string", () => {
	assertParser(Type, "string[]", new ArrayType(new Predefined.StringType()));
});

Deno.test("Array of Array of PredefinedType: string", () => {
	assertParser(Type, "string[][]", new ArrayType(new ArrayType(new Predefined.StringType())));
});

Deno.test("Parenthesised PredefinedType: null", () => {
	assertParser(Type, "(null)", new Literal.NullType());
});

Deno.test("Parenthesised Array of PredefinedType: string", () => {
	assertParser(Type, "(string[])", new ArrayType(new Predefined.StringType()));
});

Deno.test("Tuple (empty)", () => {
	assertParser(Type, "[]", new TupleType([]));
});

Deno.test("Tuple of PredefinedType: string", () => {
	assertParser(Type, "[string]", new TupleType([new Predefined.StringType()]));
});

Deno.test("Tuple of two PredefinedTypes: string, number", () => {
	assertParser(Type, "[string, number]", new TupleType([new Predefined.StringType(), new Predefined.NumberType()]));
});

Deno.test("TypeReference (Simple)", () => {
	assertParser(Type, "String", new TypeReference(new Identifier("String")));
});

Deno.test("TypeReference with a single TypeParameter", () => {
	assertParser(Type, "String<number>", new TypeReference(new Identifier("String"), [new Predefined.NumberType()]));
});

Deno.test("TypeReference with multiple TypeParameters", () => {
	assertParser(
		Type,
		"String<number, string>",
		new TypeReference(new Identifier("String"), [new Predefined.NumberType(), new Predefined.StringType()]),
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
				new TypeReference(new Identifier("F"), [new Predefined.StringType()]),
				new Predefined.StringType(),
			],
		),
	);
});

Deno.test("Parenthesised Array of TypeReferences with TypeParameter", () => {
	assertParser(
		Type,
		"(String<number>[])[]",
		new ArrayType(new ArrayType(new TypeReference(new Identifier("String"), [new Predefined.NumberType()]))),
	);
});

Deno.test("Union of PredefinedTypes: string, number", () => {
	assertParser(Type, "string | number", new UnionType([new Predefined.StringType(), new Predefined.NumberType()]));
});

Deno.test("Union of string and number[]", () => {
	assertParser(
		Type,
		"(string | number)[]",
		new ArrayType(new UnionType([new Predefined.StringType(), new Predefined.NumberType()])),
	);
});

Deno.test("Array of Array of Union of string and number", () => {
	assertParser(
		Type,
		"(string | number)[][]",
		new ArrayType(new ArrayType(new UnionType([new Predefined.StringType(), new Predefined.NumberType()]))),
	);
});

Deno.test("Union of string, number and null", () => {
	assertParser(
		Type,
		"string | number | null",
		new UnionType([
			new Predefined.StringType(),
			new UnionType([new Predefined.NumberType(), new Literal.NullType()]),
		]),
	);
});

Deno.test("Object with Parenthesis and Arrays", () => {
	assertParser(
		Type,
		"({ key: string; key2: number[] })",
		new ObjectType([
			new Member(new Identifier("key"), new Predefined.StringType(), {
				doc: null,
				modifiers: [],
				optional: false,
			}),
			new Member(new Identifier("key2"), new ArrayType(new Predefined.NumberType()), {
				doc: null,
				modifiers: [],
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
					new Member(new Identifier("foo"), new ArrayType(new ArrayType(new Predefined.StringType())), {
						doc: null,
						modifiers: [],
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
			new Member(new Identifier("key"), new Literal.StringType("value"), {
				doc: null,
				modifiers: [],
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
						{ doc: null, modifiers: [], optional: false },
					),
				]),
				{ doc: null, modifiers: [], optional: false },
			),
			new Member(new IndexKey("rest", new Predefined.StringType()), new Predefined.StringType(), {
				doc: null,
				modifiers: [],
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
