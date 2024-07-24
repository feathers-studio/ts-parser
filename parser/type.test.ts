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
	assertParser(IndexKey.parse, "[key: string]", IndexKey.from("key", Predefined.String.from()));
});

Deno.test("Member: 1", () => {
	assertParser(
		Member.parse,
		" [ property :   string]  :   string",
		Member.from(IndexKey.from("property", Predefined.String.from()), Predefined.String.from(), {
			doc: null,
			modifier: [],
			optional: false,
		}),
	);
});

Deno.test("Member: 2", () => {
	assertParser(
		Member.parse,
		"readonly   hello ? : World",
		Member.from(Identifier.from("hello"), TypeReference.from(Identifier.from("World")), {
			doc: null,
			modifier: ["readonly"],
			optional: true,
		}),
	);
});

Deno.test("Member: 3", () => {
	assertParser(
		Member.parse,
		"readonly public  hello : World.Rivers.Amazon",
		Member.from(
			Identifier.from("hello"),
			TypeReference.from(
				QualifiedName.from(
					QualifiedName.from(Identifier.from("World"), Identifier.from("Rivers")),
					Identifier.from("Amazon"),
				),
			),
			{ doc: null, modifier: ["readonly", "public"], optional: false },
		),
	);
});

Deno.test("Member: 4", () => {
	assertParser(
		Member.parse,
		'readonly  protected  [ hello: string ] : "World"',
		Member.from(IndexKey.from("hello", Predefined.String.from()), Literal.String.from("World"), {
			doc: null,
			modifier: ["readonly", "protected"],
			optional: false,
		}),
	);
});

Deno.test("Member: 5", () => {
	assertParser(
		Member.parse,
		"readonly public  hello ? : World<Rivers, Amazon>",
		Member.from(
			Identifier.from("hello"),
			TypeReference.from(Identifier.from("World"), [
				TypeReference.from(Identifier.from("Rivers")),
				TypeReference.from(Identifier.from("Amazon")),
			]),
			{ doc: null, modifier: ["readonly", "public"], optional: true },
		),
	);
});

Deno.test("PrimitiveType: string", () => {
	assertParser(Type, '"Hello, World!"', Literal.String.from("Hello, World!"));
});

Deno.test("PrimitiveType: number", () => {
	assertParser(Type, "123", Literal.Number.from(123));
});

Deno.test("Primitive: boolean", () => {
	assertParser(Type, "true", Literal.Boolean.from(true));
});

Deno.test("Primitive: null", () => {
	assertParser(Type, "null", Literal.Null.from());
});

Deno.test("Primitive: undefined", () => {
	assertParser(Type, "undefined", Literal.Undefined.from());
});

Deno.test("Primitive: symbol", () => {
	assertParser(Type, "symbol", Literal.SymbolType.from(false));
});

Deno.test("Primitive: bigint", () => {
	assertParser(Type, "123n", Literal.BigIntType.from(123n));
});

Deno.test("PredefinedType: string", () => {
	assertParser(Type, "string", Predefined.String.from());
});

Deno.test("PredefinedType: any", () => {
	assertParser(Type, "any", Predefined.Any.from());
});

Deno.test("PredefinedType: number", () => {
	assertParser(Type, "number", Predefined.Number.from());
});

Deno.test("PredefinedType: boolean", () => {
	assertParser(Type, "boolean", Predefined.Boolean.from());
});

Deno.test("PredefinedType: bigint", () => {
	assertParser(Type, "bigint", Predefined.BigInt.from());
});

Deno.test("PredefinedType: void", () => {
	assertParser(Type, "void", Predefined.Void.from());
});

Deno.test("PredefinedType: never", () => {
	assertParser(Type, "never", Predefined.Never.from());
});

Deno.test("Array of PredefinedType: string", () => {
	assertParser(Type, "string[]", ArrayType.from(Predefined.String.from()));
});

Deno.test("Array of Array of PredefinedType: string", () => {
	assertParser(Type, "string[][]", ArrayType.from(ArrayType.from(Predefined.String.from())));
});

Deno.test("Parenthesised PredefinedType: null", () => {
	assertParser(Type, "(null)", Literal.Null.from());
});

Deno.test("Parenthesised Array of PredefinedType: string", () => {
	assertParser(Type, "(string[])", ArrayType.from(Predefined.String.from()));
});

Deno.test("Tuple (empty)", () => {
	assertParser(Type, "[]", TupleType.from([]));
});

Deno.test("Tuple of PredefinedType: string", () => {
	assertParser(Type, "[string]", TupleType.from([Predefined.String.from()]));
});

Deno.test("Tuple of two PredefinedTypes: string, number", () => {
	assertParser(Type, "[string, number]", TupleType.from([Predefined.String.from(), Predefined.Number.from()]));
});

Deno.test("TypeReference (Simple)", () => {
	assertParser(Type, "String", TypeReference.from(Identifier.from("String")));
});

Deno.test("TypeReference with a single TypeParameter", () => {
	assertParser(Type, "String<number>", TypeReference.from(Identifier.from("String"), [Predefined.Number.from()]));
});

Deno.test("TypeReference with multiple TypeParameters", () => {
	assertParser(
		Type,
		"String<number, string>",
		TypeReference.from(Identifier.from("String"), [Predefined.Number.from(), Predefined.String.from()]),
	);
});

Deno.test("TypeReference with Namespaces and nested TypeParameters", () => {
	assertParser(
		Type,
		"S.P.Q.R<A.B.C.D, F<string>, string>",
		TypeReference.from(
			QualifiedName.from(
				QualifiedName.from(
					QualifiedName.from(Identifier.from("S"), Identifier.from("P")),
					Identifier.from("Q"),
				),
				Identifier.from("R"),
			),
			[
				TypeReference.from(
					QualifiedName.from(
						QualifiedName.from(
							QualifiedName.from(Identifier.from("A"), Identifier.from("B")),
							Identifier.from("C"),
						),
						Identifier.from("D"),
					),
				),
				TypeReference.from(Identifier.from("F"), [Predefined.String.from()]),
				Predefined.String.from(),
			],
		),
	);
});

Deno.test("Parenthesised Array of TypeReferences with TypeParameter", () => {
	assertParser(
		Type,
		"(String<number>[])[]",
		ArrayType.from(ArrayType.from(TypeReference.from(Identifier.from("String"), [Predefined.Number.from()]))),
	);
});

Deno.test("Union of PredefinedTypes: string, number", () => {
	assertParser(Type, "string | number", UnionType.from([Predefined.String.from(), Predefined.Number.from()]));
});

Deno.test("Union of string and number[]", () => {
	assertParser(
		Type,
		"(string | number)[]",
		ArrayType.from(UnionType.from([Predefined.String.from(), Predefined.Number.from()])),
	);
});

Deno.test("Array of Array of Union of string and number", () => {
	assertParser(
		Type,
		"(string | number)[][]",
		ArrayType.from(ArrayType.from(UnionType.from([Predefined.String.from(), Predefined.Number.from()]))),
	);
});

Deno.test("Union of string, number and null", () => {
	assertParser(
		Type,
		"string | number | null",
		UnionType.from([Predefined.String.from(), UnionType.from([Predefined.Number.from(), Literal.Null.from()])]),
	);
});

Deno.test("Object with Parenthesis and Arrays", () => {
	assertParser(
		Type,
		"({ key: string; key2: number[] })",
		ObjectType.from([
			Member.from(Identifier.from("key"), Predefined.String.from(), { doc: null, modifier: [], optional: false }),
			Member.from(Identifier.from("key2"), ArrayType.from(Predefined.Number.from()), {
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
		IntersectionType.from([
			TypeReference.from(Identifier.from("A")),
			IntersectionType.from([TypeReference.from(Identifier.from("B")), TypeReference.from(Identifier.from("C"))]),
		]),
	);
});

Deno.test("Union of Intersection of TypeReferences", () => {
	assertParser(
		Type,
		"A & B | C & D",
		UnionType.from([
			IntersectionType.from([TypeReference.from(Identifier.from("A")), TypeReference.from(Identifier.from("B"))]),
			IntersectionType.from([TypeReference.from(Identifier.from("C")), TypeReference.from(Identifier.from("D"))]),
		]),
	);
});

Deno.test("Union of Intersection of TypeReferences (Parenthesised)", () => {
	assertParser(
		Type,
		"A & (B | C) & D",
		IntersectionType.from([
			TypeReference.from(Identifier.from("A")),
			IntersectionType.from([
				UnionType.from([TypeReference.from(Identifier.from("B")), TypeReference.from(Identifier.from("C"))]),
				TypeReference.from(Identifier.from("D")),
			]),
		]),
	);
});

Deno.test("Object with Parenthesis and Arrays (2)", () => {
	assertParser(
		Type,
		"({ foo: (string[])[] })[][]",
		ArrayType.from(
			ArrayType.from(
				ObjectType.from([
					Member.from(Identifier.from("foo"), ArrayType.from(ArrayType.from(Predefined.String.from())), {
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
		ObjectType.from([
			Member.from(Identifier.from("key"), Literal.String.from("value"), {
				doc: null,
				modifier: [],
				optional: false,
			}),
			Member.from(
				Identifier.from("key2"),
				ObjectType.from([
					Member.from(
						Identifier.from("nestedKey"),
						TypeReference.from(
							QualifiedName.from(
								QualifiedName.from(
									QualifiedName.from(Identifier.from("S"), Identifier.from("P")),
									Identifier.from("Q"),
								),
								Identifier.from("R"),
							),
							[TypeReference.from(Identifier.from("X"))],
						),
						{ doc: null, modifier: [], optional: false },
					),
				]),
				{ doc: null, modifier: [], optional: false },
			),
			Member.from(IndexKey.from("rest", Predefined.String.from()), Predefined.String.from(), {
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
