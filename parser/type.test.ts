import { assertParser } from "./utils.ts";
import { Type, PropertySignature, IndexSignature, ObjectType, TupleType } from "./type.ts";
import { TypeReference } from "./type.ts";
import { QualifiedName } from "./type.ts";
import { ArrayType } from "./type.ts";
import { IntersectionType } from "./type.ts";
import { UnionType } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";
import { Predefined } from "./predefined.ts";

Deno.test(
	"Index Key", //
	() => {
		assertParser(IndexSignature.parser, "[key: string]", new IndexSignature("key", new Predefined.StringType()));
	},
);

Deno.test("Index Key (with spaces)", () => {
	assertParser(IndexSignature.parser, "[ key : string ]", new IndexSignature("key", new Predefined.StringType()));
});

Deno.test("Member: 1", () => {
	assertParser(
		PropertySignature.parser,
		" [ property :   string]  :   string ;",
		new PropertySignature(
			new IndexSignature("property", new Predefined.StringType()),
			new Predefined.StringType(),
			{
				doc: null,
				modifiers: [],
				optional: false,
			},
		),
	);
});

Deno.test("Member: 2", () => {
	assertParser(
		PropertySignature.parser,
		"readonly   hello ? : World;",
		new PropertySignature(new Identifier("hello"), new TypeReference(new Identifier("World")), {
			doc: null,
			modifiers: ["readonly"],
			optional: true,
		}),
	);
});

Deno.test("Member: 3", () => {
	assertParser(
		PropertySignature.parser,
		"readonly public  hello : World.Rivers.Amazon               	;",
		new PropertySignature(
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
		PropertySignature.parser,
		'readonly  protected  [ hello: string ] : "World" \n',
		new PropertySignature(
			new IndexSignature("hello", new Predefined.StringType()),
			new Literal.StringType("World"),
			{
				doc: null,
				modifiers: ["readonly", "protected"],
				optional: false,
			},
		),
	);
});

Deno.test("Member: 5", () => {
	assertParser(
		PropertySignature.parser,
		"readonly public  hello ? : World<Rivers, Amazon>;",
		new PropertySignature(
			new Identifier("hello"),
			new TypeReference(new Identifier("World"), [
				new TypeReference(new Identifier("Rivers")),
				new TypeReference(new Identifier("Amazon")),
			]),
			{ doc: null, modifiers: ["readonly", "public"], optional: true },
		),
	);
});

Deno.test("Member: 6", () => {
	assertParser(
		PropertySignature.parser,
		"readonly public  hello ? : World<Rivers, Amazon>[][],",
		new PropertySignature(
			new Identifier("hello"),
			new ArrayType(
				new ArrayType(
					new TypeReference(new Identifier("World"), [
						new TypeReference(new Identifier("Rivers")),
						new TypeReference(new Identifier("Amazon")),
					]),
				),
			),
			{ doc: null, modifiers: ["readonly", "public"], optional: true },
		),
	);
});

Deno.test("LiteralType: string", () => {
	assertParser(Type, '"Hello, World!"', new Literal.StringType("Hello, World!"));
});

Deno.test("LiteralType: number", () => {
	assertParser(Type, "123", new Literal.NumberType(123));
});

Deno.test("LiteralType: number (negative)", () => {
	assertParser(Type, "-123", new Literal.NumberType(-123));
});

Deno.test("LiteralType: number (float)", () => {
	assertParser(Type, "123.456", new Literal.NumberType(123.456));
});

Deno.test("LiteralType: number (negative float)", () => {
	assertParser(Type, "-123.456", new Literal.NumberType(-123.456));
});

Deno.test("LiteralType: number (exponential)", () => {
	assertParser(Type, "123e3", new Literal.NumberType(123e3));
});

Deno.test("LiteralType: number (negative exponential)", () => {
	assertParser(Type, "-123e3", new Literal.NumberType(-123e3));
});

Deno.test("LiteralType: number (float exponential)", () => {
	assertParser(Type, "123.456e3", new Literal.NumberType(123.456e3));
});

Deno.test("LiteralType: number (negative float exponential)", () => {
	assertParser(Type, "-123.456e3", new Literal.NumberType(-123.456e3));
});

Deno.test("LiteralType: boolean (true)", () => {
	assertParser(Type, "true", new Literal.BooleanType(true));
});

Deno.test("LiteralType: boolean (false)", () => {
	assertParser(Type, "false", new Literal.BooleanType(false));
});

Deno.test("LiteralType: null", () => {
	assertParser(Type, "null", new Literal.NullType());
});

Deno.test("LiteralType: undefined", () => {
	assertParser(Type, "undefined", new Literal.UndefinedType());
});

Deno.test("LiteralType: symbol", () => {
	assertParser(Type, "symbol", new Literal.SymbolType(false));
});

Deno.test("LiteralType: unique symbol", () => {
	assertParser(Type, "unique symbol", new Literal.SymbolType(true));
});

Deno.test("LiteralType: bigint", () => {
	assertParser(Type, "123n", new Literal.BigIntType(123n));
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

Deno.test("Array of PredefinedType: string", () => {
	assertParser(Type, "string[]", new ArrayType(new Predefined.StringType()));
});

Deno.test("Array of Array of PredefinedType: string", () => {
	assertParser(Type, "string[][]", new ArrayType(new ArrayType(new Predefined.StringType())));
});

Deno.test("Parenthesised PredefinedType: string", () => {
	assertParser(Type, "(string)", new Predefined.StringType());
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

Deno.test("TypeReference with nested TypeParameters", () => {
	assertParser(
		Type,
		"String<number, F<string>>",
		new TypeReference(new Identifier("String"), [
			new Predefined.NumberType(),
			new TypeReference(new Identifier("F"), [new Predefined.StringType()]),
		]),
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

Deno.test("Parenthesised Array of TypeReference", () => {
	assertParser(
		Type,
		"(String<number>)[]",
		new ArrayType(new TypeReference(new Identifier("String"), [new Predefined.NumberType()])),
	);
});

Deno.test("Intersection of PredefinedTypes: string, number", () => {
	assertParser(
		Type,
		"string & number",
		new IntersectionType([new Predefined.StringType(), new Predefined.NumberType()]),
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

Deno.test("Array of Union of string and number", () => {
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

Deno.test("Union of string, number and null (Parenthesised)", () => {
	assertParser(
		Type,
		"(string | number | null)",
		new UnionType([
			new Predefined.StringType(),
			new UnionType([new Predefined.NumberType(), new Literal.NullType()]),
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

Deno.test("Intersection of TypeReferences (Parenthesised)", () => {
	assertParser(
		Type,
		"A & (B & C)",
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

Deno.test("Union of Intersection of TypeReferences (Parenthesised 2)", () => {
	assertParser(
		Type,
		"A & B | (C & D)",
		new UnionType([
			new IntersectionType([new TypeReference(new Identifier("A")), new TypeReference(new Identifier("B"))]),
			new IntersectionType([new TypeReference(new Identifier("C")), new TypeReference(new Identifier("D"))]),
		]),
	);
});

Deno.test("Object with Parenthesis and Arrays", () => {
	assertParser(
		Type,
		`({ key: string;
		key2: number[] })`,
		new ObjectType([
			new PropertySignature(new Identifier("key"), new Predefined.StringType(), {
				doc: null,
				modifiers: [],
				optional: false,
			}),
			new PropertySignature(new Identifier("key2"), new ArrayType(new Predefined.NumberType()), {
				doc: null,
				modifiers: [],
				optional: false,
			}),
		]),
	);
});

Deno.test("Object with Parenthesis and Arrays (2)", () => {
	assertParser(
		Type,
		"({ foo: (string[])[] })",
		new ObjectType([
			new PropertySignature(new Identifier("foo"), new ArrayType(new ArrayType(new Predefined.StringType())), {
				doc: null,
				modifiers: [],
				optional: false,
			}),
		]),
	);
});

Deno.test("Object with Parenthesis and Arrays (3)", () => {
	assertParser(
		Type,
		"({ foo: (string[])[] })[][]",
		new ArrayType(
			new ArrayType(
				new ObjectType([
					new PropertySignature(
						new Identifier("foo"),
						new ArrayType(new ArrayType(new Predefined.StringType())),
						{
							doc: null,
							modifiers: [],
							optional: false,
						},
					),
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
			new PropertySignature(new Identifier("key"), new Literal.StringType("value"), {
				doc: null,
				modifiers: [],
				optional: false,
			}),
			new PropertySignature(
				new Identifier("key2"),
				new ObjectType([
					new PropertySignature(
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
			new PropertySignature(
				new IndexSignature("rest", new Predefined.StringType()),
				new Predefined.StringType(),
				{
					doc: null,
					modifiers: [],
					optional: false,
				},
			),
		]),
	);
});

Deno.test("Object (complex) with optional members", () => {
	assertParser(
		Type,
		'{ key?: "value"; key2?: { nestedKey: S.P.Q.R<X> }, [rest: string]?: string }',
		new ObjectType([
			new PropertySignature(new Identifier("key"), new Literal.StringType("value"), {
				doc: null,
				modifiers: [],
				optional: true,
			}),
			new PropertySignature(
				new Identifier("key2"),
				new ObjectType([
					new PropertySignature(
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
				{ doc: null, modifiers: [], optional: true },
			),
			new PropertySignature(
				new IndexSignature("rest", new Predefined.StringType()),
				new Predefined.StringType(),
				{
					doc: null,
					modifiers: [],
					optional: true,
				},
			),
		]),
	);
});

Deno.test("Object (empty)", () => {
	assertParser(Type, "{}", new ObjectType([]));
});

Deno.test("Invalid syntax", () => {
	assertParser(Type, "string | number x[][]", new ObjectType([]), { requireFail: true });
});

Deno.test("Invalid syntax (2)", () => {
	assertParser(Type, "string | number[] x", new ObjectType([]), { requireFail: true });
});

Deno.test("Invalid syntax (3)", () => {
	assertParser(Type, "string | number[] x[]", new ObjectType([]), { requireFail: true });
});
