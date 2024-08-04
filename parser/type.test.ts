import { test } from "bun:test";
import { assertParser } from "./test-util.ts";
import {
	Type,
	Generic,
	Parameter,
	PropertySignature,
	IndexSignature,
	ObjectType,
	TupleType,
	MethodSignature,
	ConstructSignature,
	TypeQuery,
	KeyOfOperator,
} from "./type.ts";
import { TypeReference } from "./type.ts";
import { QualifiedName } from "./type.ts";
import { ArrayType } from "./type.ts";
import { IntersectionType } from "./type.ts";
import { UnionType } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";
import { Predefined } from "./predefined.ts";
import { DocString } from "./docString.ts";

test("typeof", () => {
	assertParser(Type, "typeof Value", new TypeQuery(new TypeReference(new Identifier("Value"))));
});

test("typeof with namespaces and generics", () => {
	assertParser(
		Type,
		"typeof  Namespace.Value<A, B>",
		new TypeQuery(
			new TypeReference(new QualifiedName(new Identifier("Namespace"), new Identifier("Value")), [
				new TypeReference(new Identifier("A")),
				new TypeReference(new Identifier("B")),
			]),
		),
	);
});

test("keyof", () => {
	assertParser(Type, "keyof Value", new KeyOfOperator(new TypeReference(new Identifier("Value"))));
});

test("keyof with namespaces and generics", () => {
	assertParser(
		Type,
		"keyof  Namespace.Value<A, B>",
		new KeyOfOperator(
			new TypeReference(new QualifiedName(new Identifier("Namespace"), new Identifier("Value")), [
				new TypeReference(new Identifier("A")),
				new TypeReference(new Identifier("B")),
			]),
		),
	);
});

test("keyof with other types", () => {
	assertParser(
		Type,
		"keyof  Namespace.Value<A, B> | keyof Namespace.Value<C, D>",
		new UnionType([
			new KeyOfOperator(
				new TypeReference(new QualifiedName(new Identifier("Namespace"), new Identifier("Value")), [
					new TypeReference(new Identifier("A")),
					new TypeReference(new Identifier("B")),
				]),
			),
			new KeyOfOperator(
				new TypeReference(new QualifiedName(new Identifier("Namespace"), new Identifier("Value")), [
					new TypeReference(new Identifier("C")),
					new TypeReference(new Identifier("D")),
				]),
			),
		]),
	);
});

test("Index Key", () => {
	//
	assertParser(IndexSignature.parser, "[key: string]", new IndexSignature("key", new Predefined.StringType()));
});

test("Index Key (with spaces)", () => {
	assertParser(IndexSignature.parser, "[ key : string ]", new IndexSignature("key", new Predefined.StringType()));
});

test("PropertySignature: 1", () => {
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

test("PropertySignature: 2", () => {
	assertParser(
		PropertySignature.parser,
		"readonly   hello ? : World,",
		new PropertySignature(new Identifier("hello"), new TypeReference(new Identifier("World")), {
			doc: null,
			modifiers: ["readonly"],
			optional: true,
		}),
	);
});

test("PropertySignature: 3", () => {
	assertParser(
		PropertySignature.parser,
		"readonly public  hello : World.Rivers.Amazon;",
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

test("PropertySignature: 4", () => {
	assertParser(
		PropertySignature.parser,
		'readonly  protected  [ hello: string ] : "World"			  ,',
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

test("PropertySignature: 5", () => {
	assertParser(
		PropertySignature.parser,
		"readonly public  hello ? : World<Rivers, Amazon> \n",
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

test("PropertySignature: 6", () => {
	assertParser(
		PropertySignature.parser,
		"readonly public  hello ? : World<Rivers, Amazon>[][]	,",
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

test("MethodSignature: 1", () => {
	assertParser(
		MethodSignature.parser,
		"foo(  hello ? : World<Rivers, Amazon>);",
		new MethodSignature(
			new Identifier("foo"),
			[
				new Parameter(
					new Identifier("hello"),
					new TypeReference(new Identifier("World"), [
						new TypeReference(new Identifier("Rivers")),
						new TypeReference(new Identifier("Amazon")),
					]),
					{
						doc: null,
						optional: true,
					},
				),
			],
			null,
		),
	);
});

test("MethodSignature: 2", () => {
	assertParser(
		MethodSignature.parser,
		"foo(  hello ? : World<Rivers, Amazon>): number  ,",
		new MethodSignature(
			new Identifier("foo"),
			[
				new Parameter(
					new Identifier("hello"),
					new TypeReference(new Identifier("World"), [
						new TypeReference(new Identifier("Rivers")),
						new TypeReference(new Identifier("Amazon")),
					]),
					{
						doc: null,
						optional: true,
					},
				),
			],
			new Predefined.NumberType(),
		),
	);
});

test("MethodSignature: 3", () => {
	assertParser(
		MethodSignature.parser,
		`/**
		* This is a method
		* @param hello - The hello parameter
		* @returns The return value
		*/foo<T extends A>(  hello  : World<T, Amazon>, world: T): World<T>	  \n`,
		new MethodSignature(
			new Identifier("foo"),
			[
				new Parameter(
					new Identifier("hello"),
					new TypeReference(new Identifier("World"), [
						new TypeReference(new Identifier("T")),
						new TypeReference(new Identifier("Amazon")),
					]),
					{
						doc: null,
						optional: false,
					},
				),
				new Parameter(new Identifier("world"), new TypeReference(new Identifier("T")), {
					doc: null,
					optional: false,
				}),
			],
			new TypeReference(new Identifier("World"), [new TypeReference(new Identifier("T"))]),
			{
				doc: new DocString(
					"\n\t\t* This is a method\n\t\t* @param hello - The hello parameter\n\t\t* @returns The return value\n\t\t",
				),
				generics: [new Generic(new Identifier("T"), new TypeReference(new Identifier("A")))],
			},
		),
	);
});

test("ConstructSignature: 1", () => {
	assertParser(
		ConstructSignature.parser,
		"new(  hello ? : World<Rivers, Amazon>): T;",
		new ConstructSignature(
			[
				new Parameter(
					new Identifier("hello"),
					new TypeReference(new Identifier("World"), [
						new TypeReference(new Identifier("Rivers")),
						new TypeReference(new Identifier("Amazon")),
					]),
					{
						doc: null,
						optional: true,
					},
				),
			],
			new TypeReference(new Identifier("T")),
		),
	);
});

test("ConstructSignature: 2", () => {
	assertParser(
		ConstructSignature.parser,
		"new<T extends A>(  hello ? : World<T, Amazon>),",
		new ConstructSignature(
			[
				new Parameter(
					new Identifier("hello"),
					new TypeReference(new Identifier("World"), [
						new TypeReference(new Identifier("T")),
						new TypeReference(new Identifier("Amazon")),
					]),
					{
						doc: null,
						optional: true,
					},
				),
			],
			null,
			{
				generics: [new Generic(new Identifier("T"), new TypeReference(new Identifier("A")))],
			},
		),
	);
});

test("ConstructSignature: 3", () => {
	assertParser(
		ConstructSignature.parser,
		`/** Constructor! */
		new<T extends A>(  hello ? : World<T, Amazon>): World<T>;`,
		new ConstructSignature(
			[
				new Parameter(
					new Identifier("hello"),
					new TypeReference(new Identifier("World"), [
						new TypeReference(new Identifier("T")),
						new TypeReference(new Identifier("Amazon")),
					]),
					{
						doc: null,
						optional: true,
					},
				),
			],
			new TypeReference(new Identifier("World"), [new TypeReference(new Identifier("T"))]),
			{
				doc: new DocString(" Constructor! "),
				generics: [new Generic(new Identifier("T"), new TypeReference(new Identifier("A")))],
			},
		),
	);
});

test("LiteralType: string", () => {
	assertParser(Type, '"Hello, World!"', new Literal.StringType("Hello, World!"));
});

test("LiteralType: number", () => {
	assertParser(Type, "123", new Literal.NumberType(123));
});

test("LiteralType: number (negative)", () => {
	assertParser(Type, "-123", new Literal.NumberType(-123));
});

test("LiteralType: number (float)", () => {
	assertParser(Type, "123.456", new Literal.NumberType(123.456));
});

test("LiteralType: number (negative float)", () => {
	assertParser(Type, "-123.456", new Literal.NumberType(-123.456));
});

test("LiteralType: number (exponential)", () => {
	assertParser(Type, "123e3", new Literal.NumberType(123e3));
});

test("LiteralType: number (negative exponential)", () => {
	assertParser(Type, "-123e3", new Literal.NumberType(-123e3));
});

test("LiteralType: number (float exponential)", () => {
	assertParser(Type, "123.456e3", new Literal.NumberType(123.456e3));
});

test("LiteralType: number (negative float exponential)", () => {
	assertParser(Type, "-123.456e3", new Literal.NumberType(-123.456e3));
});

test("LiteralType: boolean (true)", () => {
	assertParser(Type, "true", new Literal.BooleanType(true));
});

test("LiteralType: boolean (false)", () => {
	assertParser(Type, "false", new Literal.BooleanType(false));
});

test("LiteralType: null", () => {
	assertParser(Type, "null", new Literal.NullType());
});

test("LiteralType: undefined", () => {
	assertParser(Type, "undefined", new Literal.UndefinedType());
});

test("LiteralType: symbol", () => {
	assertParser(Type, "symbol", new Literal.SymbolType(false));
});

test("LiteralType: unique symbol", () => {
	assertParser(Type, "unique symbol", new Literal.SymbolType(true));
});

test("LiteralType: bigint", () => {
	assertParser(Type, "123n", new Literal.BigIntType(123n));
});

test("PredefinedType: string", () => {
	assertParser(Type, "string", new Predefined.StringType());
});

test("PredefinedType: any", () => {
	assertParser(Type, "any", new Predefined.AnyType());
});

test("PredefinedType: number", () => {
	assertParser(Type, "number", new Predefined.NumberType());
});

test("PredefinedType: boolean", () => {
	assertParser(Type, "boolean", new Predefined.BooleanType());
});

test("PredefinedType: bigint", () => {
	assertParser(Type, "bigint", new Predefined.BigIntType());
});

test("PredefinedType: void", () => {
	assertParser(Type, "void", new Predefined.VoidType());
});

test("PredefinedType: never", () => {
	assertParser(Type, "never", new Predefined.NeverType());
});

test("Array of PredefinedType: string", () => {
	assertParser(Type, "string[]", new ArrayType(new Predefined.StringType()));
});

test("Array of Array of PredefinedType: string", () => {
	assertParser(Type, "string[][]", new ArrayType(new ArrayType(new Predefined.StringType())));
});

test("Parenthesised PredefinedType: string", () => {
	assertParser(Type, "(string)", new Predefined.StringType());
});
test("Parenthesised PredefinedType: null", () => {
	assertParser(Type, "(null)", new Literal.NullType());
});

test("Parenthesised Array of PredefinedType: string", () => {
	assertParser(Type, "(string[])", new ArrayType(new Predefined.StringType()));
});

test("Tuple (empty)", () => {
	assertParser(Type, "[]", new TupleType([]));
});

test("Tuple of PredefinedType: string", () => {
	assertParser(Type, "[string]", new TupleType([new Predefined.StringType()]));
});

test("Tuple of two PredefinedTypes: string, number", () => {
	assertParser(Type, "[string, number]", new TupleType([new Predefined.StringType(), new Predefined.NumberType()]));
});

test("TypeReference (Simple)", () => {
	assertParser(Type, "String", new TypeReference(new Identifier("String")));
});

test("TypeReference with a single TypeParameter", () => {
	assertParser(Type, "String<number>", new TypeReference(new Identifier("String"), [new Predefined.NumberType()]));
});

test("TypeReference with multiple TypeParameters", () => {
	assertParser(
		Type,
		"String<number, string>",
		new TypeReference(new Identifier("String"), [new Predefined.NumberType(), new Predefined.StringType()]),
	);
});

test("TypeReference with nested TypeParameters", () => {
	assertParser(
		Type,
		"String<number, F<string>>",
		new TypeReference(new Identifier("String"), [
			new Predefined.NumberType(),
			new TypeReference(new Identifier("F"), [new Predefined.StringType()]),
		]),
	);
});

test("TypeReference with Namespaces and nested TypeParameters", () => {
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

test("Parenthesised Array of TypeReference", () => {
	assertParser(
		Type,
		"(String<number>)[]",
		new ArrayType(new TypeReference(new Identifier("String"), [new Predefined.NumberType()])),
	);
});

test("Intersection of PredefinedTypes: string, number", () => {
	assertParser(
		Type,
		"string & number",
		new IntersectionType([new Predefined.StringType(), new Predefined.NumberType()]),
	);
});

test("Union of PredefinedTypes: string, number", () => {
	assertParser(Type, "string | number", new UnionType([new Predefined.StringType(), new Predefined.NumberType()]));
});

test("Union of string and number[]", () => {
	assertParser(
		Type,
		"(string | number)[]",
		new ArrayType(new UnionType([new Predefined.StringType(), new Predefined.NumberType()])),
	);
});

test("Array of Union of string and number", () => {
	assertParser(
		Type,
		"(string | number)[][]",
		new ArrayType(new ArrayType(new UnionType([new Predefined.StringType(), new Predefined.NumberType()]))),
	);
});

test("Union of string, number and null", () => {
	assertParser(
		Type,
		"string | number | null",
		new UnionType([
			new Predefined.StringType(),
			new UnionType([new Predefined.NumberType(), new Literal.NullType()]),
		]),
	);
});

test("Union of string, number and null (Parenthesised)", () => {
	assertParser(
		Type,
		"(string | number | null)",
		new UnionType([
			new Predefined.StringType(),
			new UnionType([new Predefined.NumberType(), new Literal.NullType()]),
		]),
	);
});

test("Intersection of TypeReferences", () => {
	assertParser(
		Type,
		"A & B & C",
		new IntersectionType([
			new TypeReference(new Identifier("A")),
			new IntersectionType([new TypeReference(new Identifier("B")), new TypeReference(new Identifier("C"))]),
		]),
	);
});

test("Intersection of TypeReferences (Parenthesised)", () => {
	assertParser(
		Type,
		"A & (B & C)",
		new IntersectionType([
			new TypeReference(new Identifier("A")),
			new IntersectionType([new TypeReference(new Identifier("B")), new TypeReference(new Identifier("C"))]),
		]),
	);
});

test("Union of Intersection of TypeReferences", () => {
	assertParser(
		Type,
		"A & B | C & D",
		new UnionType([
			new IntersectionType([new TypeReference(new Identifier("A")), new TypeReference(new Identifier("B"))]),
			new IntersectionType([new TypeReference(new Identifier("C")), new TypeReference(new Identifier("D"))]),
		]),
	);
});

test("Union of Intersection of TypeReferences (Parenthesised)", () => {
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

test("Union of Intersection of TypeReferences (Parenthesised 2)", () => {
	assertParser(
		Type,
		"A & B | (C & D)",
		new UnionType([
			new IntersectionType([new TypeReference(new Identifier("A")), new TypeReference(new Identifier("B"))]),
			new IntersectionType([new TypeReference(new Identifier("C")), new TypeReference(new Identifier("D"))]),
		]),
	);
});

test("Object with Parenthesis and Arrays", () => {
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

test("Object with Parenthesis and Arrays (2)", () => {
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

test("Object with Parenthesis and Arrays (3)", () => {
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

test("Object (complex)", () => {
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

test("Object (complex) with optional members", () => {
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

test("Object (empty)", () => {
	assertParser(Type, "{}", new ObjectType([]));
});

test("Invalid syntax", () => {
	assertParser(Type, "string | number x[][]", new ObjectType([]), { requireFail: true });
});

test("Invalid syntax (2)", () => {
	assertParser(Type, "string | number[] x", new ObjectType([]), { requireFail: true });
});

test("Invalid syntax (3)", () => {
	assertParser(Type, "string | number[] x[]", new ObjectType([]), { requireFail: true });
});
