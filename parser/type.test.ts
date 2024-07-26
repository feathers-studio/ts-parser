import { testParser } from "./utils.ts";
import { Type, Member, IndexKey, ObjectType, TupleType } from "./type.ts";
import { TypeReference } from "./type.ts";
import { QualifiedName } from "./type.ts";
import { ArrayType } from "./type.ts";
import { IntersectionType } from "./type.ts";
import { UnionType } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";
import { Predefined } from "./predefined.ts";

testParser(
	"Index Key", //
	IndexKey.parser,
	"[key: string]",
	new IndexKey("key", new Predefined.StringType()),
);

testParser(
	"Index Key (with spaces)",
	IndexKey.parser,
	"[ key : string ]",
	new IndexKey("key", new Predefined.StringType()),
);

testParser(
	"Member: 1",
	Member.parser,
	" [ property :   string]  :   string",
	new Member(new IndexKey("property", new Predefined.StringType()), new Predefined.StringType(), {
		doc: null,
		modifiers: [],
		optional: false,
	}),
);

testParser(
	"Member: 2",
	Member.parser,
	"readonly   hello ? : World",
	new Member(new Identifier("hello"), new TypeReference(new Identifier("World")), {
		doc: null,
		modifiers: ["readonly"],
		optional: true,
	}),
);

testParser(
	"Member: 3",
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

testParser(
	"Member: 4",
	Member.parser,
	'readonly  protected  [ hello: string ] : "World"',
	new Member(new IndexKey("hello", new Predefined.StringType()), new Literal.StringType("World"), {
		doc: null,
		modifiers: ["readonly", "protected"],
		optional: false,
	}),
);

testParser(
	"Member: 5",
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

testParser(
	"Member: 6",
	Member.parser,
	"readonly public  hello ? : World<Rivers, Amazon>[][]",
	new Member(
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

testParser("LiteralType: string", Type, '"Hello, World!"', new Literal.StringType("Hello, World!"));

testParser("LiteralType: number", Type, "123", new Literal.NumberType(123));

testParser("LiteralType: number (negative)", Type, "-123", new Literal.NumberType(-123));

testParser("LiteralType: number (float)", Type, "123.456", new Literal.NumberType(123.456));

testParser("LiteralType: number (negative float)", Type, "-123.456", new Literal.NumberType(-123.456));

testParser("LiteralType: number (exponential)", Type, "123e3", new Literal.NumberType(123e3));

testParser("LiteralType: number (negative exponential)", Type, "-123e3", new Literal.NumberType(-123e3));

testParser("LiteralType: number (float exponential)", Type, "123.456e3", new Literal.NumberType(123.456e3));

testParser("LiteralType: number (negative float exponential)", Type, "-123.456e3", new Literal.NumberType(-123.456e3));

testParser("LiteralType: boolean (true)", Type, "true", new Literal.BooleanType(true));

testParser("LiteralType: boolean (false)", Type, "false", new Literal.BooleanType(false));

testParser("LiteralType: null", Type, "null", new Literal.NullType());

testParser("LiteralType: undefined", Type, "undefined", new Literal.UndefinedType());

testParser("LiteralType: symbol", Type, "symbol", new Literal.SymbolType(false));

testParser("LiteralType: unique symbol", Type, "unique symbol", new Literal.SymbolType(true));

testParser("LiteralType: bigint", Type, "123n", new Literal.BigIntType(123n));

testParser("PredefinedType: string", Type, "string", new Predefined.StringType());

testParser("PredefinedType: any", Type, "any", new Predefined.AnyType());

testParser("PredefinedType: number", Type, "number", new Predefined.NumberType());

testParser("PredefinedType: boolean", Type, "boolean", new Predefined.BooleanType());

testParser("PredefinedType: bigint", Type, "bigint", new Predefined.BigIntType());

testParser("PredefinedType: void", Type, "void", new Predefined.VoidType());

testParser("PredefinedType: never", Type, "never", new Predefined.NeverType());

testParser("Array of PredefinedType: string", Type, "string[]", new ArrayType(new Predefined.StringType()));

testParser(
	"Array of Array of PredefinedType: string",
	Type,
	"string[][]",
	new ArrayType(new ArrayType(new Predefined.StringType())),
);

testParser("Parenthesised PredefinedType: string", Type, "(string)", new Predefined.StringType());
testParser("Parenthesised PredefinedType: null", Type, "(null)", new Literal.NullType());

testParser(
	"Parenthesised Array of PredefinedType: string",
	Type,
	"(string[])",
	new ArrayType(new Predefined.StringType()),
);

testParser("Tuple (empty)", Type, "[]", new TupleType([]));

testParser("Tuple of PredefinedType: string", Type, "[string]", new TupleType([new Predefined.StringType()]));

testParser(
	"Tuple of two PredefinedTypes: string, number",
	Type,
	"[string, number]",
	new TupleType([new Predefined.StringType(), new Predefined.NumberType()]),
);

testParser("TypeReference (Simple)", Type, "String", new TypeReference(new Identifier("String")));

testParser(
	"TypeReference with a single TypeParameter",
	Type,
	"String<number>",
	new TypeReference(new Identifier("String"), [new Predefined.NumberType()]),
);

testParser(
	"TypeReference with multiple TypeParameters",
	Type,
	"String<number, string>",
	new TypeReference(new Identifier("String"), [new Predefined.NumberType(), new Predefined.StringType()]),
);

testParser(
	"TypeReference with nested TypeParameters",
	Type,
	"String<number, F<string>>",
	new TypeReference(new Identifier("String"), [
		new Predefined.NumberType(),
		new TypeReference(new Identifier("F"), [new Predefined.StringType()]),
	]),
);

testParser(
	"TypeReference with Namespaces and nested TypeParameters",
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
					new QualifiedName(new QualifiedName(new Identifier("A"), new Identifier("B")), new Identifier("C")),
					new Identifier("D"),
				),
			),
			new TypeReference(new Identifier("F"), [new Predefined.StringType()]),
			new Predefined.StringType(),
		],
	),
);

testParser(
	"Parenthesised Array of TypeReference",
	Type,
	"(String<number>)[]",
	new ArrayType(new TypeReference(new Identifier("String"), [new Predefined.NumberType()])),
);

testParser(
	"Intersection of PredefinedTypes: string, number",
	Type,
	"string & number",
	new IntersectionType([new Predefined.StringType(), new Predefined.NumberType()]),
);

testParser(
	"Union of PredefinedTypes: string, number",
	Type,
	"string | number",
	new UnionType([new Predefined.StringType(), new Predefined.NumberType()]),
);

testParser(
	"Union of string and number[]",
	Type,
	"(string | number)[]",
	new ArrayType(new UnionType([new Predefined.StringType(), new Predefined.NumberType()])),
);

testParser(
	"Array of Union of string and number",
	Type,
	"(string | number)[][]",
	new ArrayType(new ArrayType(new UnionType([new Predefined.StringType(), new Predefined.NumberType()]))),
);

testParser(
	"Union of string, number and null",
	Type,
	"string | number | null",
	new UnionType([new Predefined.StringType(), new UnionType([new Predefined.NumberType(), new Literal.NullType()])]),
);

testParser(
	"Union of string, number and null (Parenthesised)",
	Type,
	"(string | number | null)",
	new UnionType([new Predefined.StringType(), new UnionType([new Predefined.NumberType(), new Literal.NullType()])]),
);

testParser(
	"Intersection of TypeReferences",
	Type,
	"A & B & C",
	new IntersectionType([
		new TypeReference(new Identifier("A")),
		new IntersectionType([new TypeReference(new Identifier("B")), new TypeReference(new Identifier("C"))]),
	]),
);

testParser(
	"Intersection of TypeReferences (Parenthesised)",
	Type,
	"A & (B & C)",
	new IntersectionType([
		new TypeReference(new Identifier("A")),
		new IntersectionType([new TypeReference(new Identifier("B")), new TypeReference(new Identifier("C"))]),
	]),
);

testParser(
	"Union of Intersection of TypeReferences",
	Type,
	"A & B | C & D",
	new UnionType([
		new IntersectionType([new TypeReference(new Identifier("A")), new TypeReference(new Identifier("B"))]),
		new IntersectionType([new TypeReference(new Identifier("C")), new TypeReference(new Identifier("D"))]),
	]),
);

testParser(
	"Union of Intersection of TypeReferences (Parenthesised)",
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

testParser(
	"Union of Intersection of TypeReferences (Parenthesised 2)",
	Type,
	"A & B | (C & D)",
	new UnionType([
		new IntersectionType([new TypeReference(new Identifier("A")), new TypeReference(new Identifier("B"))]),
		new IntersectionType([new TypeReference(new Identifier("C")), new TypeReference(new Identifier("D"))]),
	]),
);

testParser(
	"Object with Parenthesis and Arrays",
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

testParser(
	"Object with Parenthesis and Arrays (2)",
	Type,
	"({ foo: (string[])[] })",
	new ObjectType([
		new Member(new Identifier("foo"), new ArrayType(new ArrayType(new Predefined.StringType())), {
			doc: null,
			modifiers: [],
			optional: false,
		}),
	]),
);

testParser(
	"Object with Parenthesis and Arrays (3)",
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

testParser(
	"Object (complex)",
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

testParser(
	"Object (complex) with optional members",
	Type,
	'{ key?: "value"; key2?: { nestedKey: S.P.Q.R<X> }, [rest: string]?: string }',
	new ObjectType([
		new Member(new Identifier("key"), new Literal.StringType("value"), {
			doc: null,
			modifiers: [],
			optional: true,
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
			{ doc: null, modifiers: [], optional: true },
		),
		new Member(new IndexKey("rest", new Predefined.StringType()), new Predefined.StringType(), {
			doc: null,
			modifiers: [],
			optional: true,
		}),
	]),
);

testParser("Object (empty)", Type, "{}", new ObjectType([]));

testParser("Invalid syntax", Type, "string | number x[][]", new ObjectType([]), { requireFail: true });

testParser("Invalid syntax (2)", Type, "string | number[] x", new ObjectType([]), { requireFail: true });

testParser("Invalid syntax (3)", Type, "string | number[] x[]", new ObjectType([]), { requireFail: true });
