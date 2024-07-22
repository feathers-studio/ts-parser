import { assertParser, assertParserFails } from "./utils.ts";
import { Type, Member, indexKey } from "./type.ts";

Deno.test("Index Key", () => {
	assertParser(indexKey, "[key: string]", {
		type: "index-key",
		key: "key",
		indexType: { primitive: true, type: "string", value: null },
	});
});

Deno.test("Member: 1", () => {
	assertParser(Member, " [ property :   string]  :   string", {
		type: "member",
		doc: null,
		modifier: [],
		key: {
			type: "index-key",
			key: "property",
			indexType: { primitive: true, type: "string", value: null },
		},
		optional: false,
		value: { primitive: true, type: "string", value: null },
	});
});

Deno.test("Member: 2", () => {
	assertParser(Member, "readonly   hello ? : World", {
		type: "member",
		doc: null,
		modifier: ["readonly"],
		key: { type: "identifier", name: "hello" },
		optional: true,
		value: {
			type: "type-reference",
			name: {
				type: "identifier",
				name: "World",
			},
			typeArguments: null,
		},
	});
});

Deno.test("Member: 3", () => {
	assertParser(Member, "readonly public  hello : World.Rivers.Amazon", {
		type: "member",
		doc: null,
		modifier: ["readonly", "public"],
		key: { type: "identifier", name: "hello" },
		optional: false,
		value: {
			type: "type-reference",
			name: {
				type: "qualified-name",
				left: {
					type: "qualified-name",
					left: { type: "identifier", name: "World" },
					name: { type: "identifier", name: "Rivers" },
				},
				name: { type: "identifier", name: "Amazon" },
			},
			typeArguments: null,
		},
	});
});

Deno.test("Member: 4", () => {
	assertParser(Member, 'readonly  protected  [ hello: string ] : "World"', {
		type: "member",
		doc: null,
		modifier: ["readonly", "protected"],
		key: {
			type: "index-key",
			key: "hello",
			indexType: { primitive: true, type: "string", value: null },
		},
		optional: false,
		value: { primitive: true, type: "string", value: "World" },
	});
});

Deno.test("Member: 5", () => {
	assertParser(Member, "readonly public  hello ? : World<Rivers, Amazon>", {
		type: "member",
		doc: null,
		modifier: ["readonly", "public"],
		key: { type: "identifier", name: "hello" },
		optional: true,
		value: {
			type: "type-reference",
			name: {
				type: "identifier",
				name: "World",
			},
			typeArguments: [
				{ type: "type-reference", name: { type: "identifier", name: "Rivers" }, typeArguments: null },
				{ type: "type-reference", name: { type: "identifier", name: "Amazon" }, typeArguments: null },
			],
		},
	});
});

Deno.test("PrimitiveType: string", () => {
	assertParser(Type, '"Hello, World!"', { primitive: true, type: "string", value: "Hello, World!" });
});

Deno.test("PrimitiveType: number", () => {
	assertParser(Type, "123", { primitive: true, type: "number", value: 123 });
});

Deno.test("Primitive: boolean", () => {
	assertParser(Type, "true", { primitive: true, type: "boolean", value: true });
});

Deno.test("Primitive: null", () => {
	assertParser(Type, "null", { primitive: true, type: "null" });
});

Deno.test("Primitive: undefined", () => {
	assertParser(Type, "undefined", { primitive: true, type: "undefined" });
});

Deno.test("Primitive: symbol", () => {
	assertParser(Type, "symbol", { primitive: true, type: "symbol", unique: false });
});

Deno.test("Primitive: bigint", () => {
	assertParser(Type, "123n", { primitive: true, type: "bigint", value: 123n });
});

Deno.test("PredefinedType: string", () => {
	assertParser(Type, "string", { primitive: true, type: "string", value: null });
});

Deno.test("PredefinedType: any", () => {
	assertParser(Type, "any", { type: "predefined", value: "any" });
});

Deno.test("Array of PredefinedType: string", () => {
	assertParser(Type, "string[]", {
		type: "array",
		value: { primitive: true, type: "string", value: null },
	});
});

Deno.test("Array of Array of PredefinedType: string", () => {
	assertParser(Type, "string[][]", {
		type: "array",
		value: {
			type: "array",
			value: { primitive: true, type: "string", value: null },
		},
	});
});

Deno.test("Parenthesised PredefinedType: null", () => {
	assertParser(Type, "(null)", { primitive: true, type: "null" });
});

Deno.test("Parenthesised Array of PredefinedType: string", () => {
	assertParser(Type, "(string[])", {
		type: "array",
		value: { primitive: true, type: "string", value: null },
	});
});

Deno.test("Tuple (empty)", () => {
	assertParser(Type, "[]", {
		type: "tuple",
		values: [],
	});
});

Deno.test("Tuple of PredefinedType: string", () => {
	assertParser(Type, "[string]", {
		type: "tuple",
		values: [{ primitive: true, type: "string", value: null }],
	});
});

Deno.test("Tuple of two PredefinedTypes: string, number", () => {
	assertParser(Type, "[string, number]", {
		type: "tuple",
		values: [
			{ primitive: true, type: "string", value: null },
			{ primitive: true, type: "number", value: null },
		],
	});
});

Deno.test("TypeReference (Simple)", () => {
	assertParser(Type, "String", {
		type: "type-reference",
		name: {
			type: "identifier",
			name: "String",
		},
		typeArguments: null,
	});
});

Deno.test("TypeReference with a single TypeParameter", () => {
	assertParser(Type, "String<number>", {
		type: "type-reference",
		name: {
			type: "identifier",
			name: "String",
		},
		typeArguments: [{ primitive: true, type: "number", value: null }],
	});
});

Deno.test("TypeReference with multiple TypeParameters", () => {
	assertParser(Type, "String<number, string>", {
		type: "type-reference",
		name: {
			type: "identifier",
			name: "String",
		},
		typeArguments: [
			{ primitive: true, type: "number", value: null },
			{ primitive: true, type: "string", value: null },
		],
	});
});

Deno.test("TypeReference with Namespaces and nested TypeParameters", () => {
	assertParser(Type, "S.P.Q.R<A.B.C.D, F<string>, string>", {
		type: "type-reference",
		name: {
			type: "qualified-name",
			left: {
				type: "qualified-name",
				left: {
					type: "qualified-name",
					left: {
						type: "identifier",
						name: "S",
					},
					name: {
						type: "identifier",
						name: "P",
					},
				},
				name: {
					type: "identifier",
					name: "Q",
				},
			},
			name: {
				type: "identifier",
				name: "R",
			},
		},
		typeArguments: [
			{
				type: "type-reference",
				name: {
					type: "qualified-name",
					left: {
						type: "qualified-name",
						left: {
							type: "qualified-name",
							left: {
								type: "identifier",
								name: "A",
							},
							name: {
								type: "identifier",
								name: "B",
							},
						},
						name: {
							type: "identifier",
							name: "C",
						},
					},
					name: {
						type: "identifier",
						name: "D",
					},
				},
				typeArguments: null,
			},
			{
				type: "type-reference",
				name: {
					type: "identifier",
					name: "F",
				},
				typeArguments: [{ primitive: true, type: "string", value: null }],
			},
			{ primitive: true, type: "string", value: null },
		],
	});
});

Deno.test("Parenthesised Array of TypeReferences with TypeParameter", () => {
	assertParser(Type, "(String<number>[])[]", {
		type: "array",
		value: {
			type: "array",
			value: {
				type: "type-reference",
				name: {
					type: "identifier",
					name: "String",
				},
				typeArguments: [{ primitive: true, type: "number", value: null }],
			},
		},
	});
});

Deno.test("Union of PredefinedTypes: string, number", () => {
	assertParser(Type, "string | number", {
		type: "union",
		types: [
			{ primitive: true, type: "string", value: null },
			{ primitive: true, type: "number", value: null },
		],
	});
});

Deno.test("Union of string and number[]", () => {
	assertParser(Type, "(string | number)[]", {
		type: "array",
		value: {
			type: "union",
			types: [
				{ primitive: true, type: "string", value: null },
				{ primitive: true, type: "number", value: null },
			],
		},
	});
});

Deno.test("Array of Array of Union of string and number", () => {
	assertParser(Type, "(string | number)[][]", {
		type: "array",
		value: {
			type: "array",
			value: {
				type: "union",
				types: [
					{ primitive: true, type: "string", value: null },
					{ primitive: true, type: "number", value: null },
				],
			},
		},
	});
});

Deno.test("Union of string, number and null", () => {
	assertParser(Type, "string | number | null", {
		type: "union",
		types: [
			{ primitive: true, type: "string", value: null },
			{
				type: "union",
				types: [
					{ primitive: true, type: "number", value: null },
					{ primitive: true, type: "null" },
				],
			},
		],
	});
});

Deno.test("Object with Parenthesis and Arrays", () => {
	assertParser(Type, "({ key: string; key2: number[] })", {
		type: "object",
		members: [
			{
				type: "member",
				doc: null,
				modifier: [],
				optional: false,
				key: { type: "identifier", name: "key" },
				value: { primitive: true, type: "string", value: null },
			},
			{
				type: "member",
				doc: null,
				modifier: [],
				optional: false,
				key: { type: "identifier", name: "key2" },
				value: {
					type: "array",
					value: { primitive: true, type: "number", value: null },
				},
			},
		],
	});
});

Deno.test("Intersection of TypeReferences", () => {
	assertParser(Type, "A & B & C", {
		type: "intersection",
		types: [
			{
				type: "type-reference",
				name: {
					type: "identifier",
					name: "A",
				},
				typeArguments: null,
			},
			{
				type: "intersection",
				types: [
					{
						type: "type-reference",
						name: {
							type: "identifier",
							name: "B",
						},
						typeArguments: null,
					},
					{
						type: "type-reference",
						name: {
							type: "identifier",
							name: "C",
						},
						typeArguments: null,
					},
				],
			},
		],
	});
});

Deno.test("Union of Intersection of TypeReferences", () => {
	assertParser(Type, "A & B | C & D", {
		type: "union",
		types: [
			{
				type: "intersection",
				types: [
					{
						type: "type-reference",
						name: {
							type: "identifier",
							name: "A",
						},
						typeArguments: null,
					},
					{
						type: "type-reference",
						name: {
							type: "identifier",
							name: "B",
						},
						typeArguments: null,
					},
				],
			},
			{
				type: "intersection",
				types: [
					{
						type: "type-reference",
						name: {
							type: "identifier",
							name: "C",
						},
						typeArguments: null,
					},
					{
						type: "type-reference",
						name: {
							type: "identifier",
							name: "D",
						},
						typeArguments: null,
					},
				],
			},
		],
	});
});

Deno.test("Union of Intersection of TypeReferences (Parenthesised)", () => {
	assertParser(Type, "A & (B | C) & D", {
		type: "intersection",
		types: [
			{
				type: "type-reference",
				name: {
					type: "identifier",
					name: "A",
				},
				typeArguments: null,
			},
			{
				type: "intersection",
				types: [
					{
						type: "union",
						types: [
							{
								type: "type-reference",
								name: {
									type: "identifier",
									name: "B",
								},
								typeArguments: null,
							},
							{
								type: "type-reference",
								name: {
									type: "identifier",
									name: "C",
								},
								typeArguments: null,
							},
						],
					},
					{
						type: "type-reference",
						name: {
							type: "identifier",
							name: "D",
						},
						typeArguments: null,
					},
				],
			},
		],
	});
});

Deno.test("Object with Parenthesis and Arrays (2)", () => {
	assertParser(Type, "({ foo: (string[])[] })[][]", {
		type: "array",
		value: {
			type: "array",
			value: {
				type: "object",
				members: [
					{
						type: "member",
						doc: null,
						modifier: [],
						optional: false,
						key: { type: "identifier", name: "foo" },
						value: {
							type: "array",
							value: {
								type: "array",
								value: { primitive: true, type: "string", value: null },
							},
						},
					},
				],
			},
		},
	});
});

Deno.test("Object (complex)", () => {
	assertParser(Type, '{ key: "value"; key2: { nestedKey: S.P.Q.R<X> }, [rest: string]: string }', {
		type: "object",
		members: [
			{
				type: "member",
				doc: null,
				modifier: [],
				optional: false,
				key: { type: "identifier", name: "key" },
				value: { primitive: true, type: "string", value: "value" },
			},
			{
				type: "member",
				doc: null,
				modifier: [],
				optional: false,
				key: { type: "identifier", name: "key2" },
				value: {
					type: "object",
					members: [
						{
							type: "member",
							doc: null,
							modifier: [],
							optional: false,
							key: { type: "identifier", name: "nestedKey" },
							value: {
								type: "type-reference",
								name: {
									type: "qualified-name",
									left: {
										type: "qualified-name",
										left: {
											type: "qualified-name",
											left: {
												type: "identifier",
												name: "S",
											},
											name: {
												type: "identifier",
												name: "P",
											},
										},
										name: {
											type: "identifier",
											name: "Q",
										},
									},
									name: {
										type: "identifier",
										name: "R",
									},
								},
								typeArguments: [
									{
										type: "type-reference",
										name: {
											type: "identifier",
											name: "X",
										},
										typeArguments: null,
									},
								],
							},
						},
					],
				},
			},
			{
				type: "member",
				doc: null,
				modifier: [],
				optional: false,
				key: {
					type: "index-key",
					key: "rest",
					indexType: { primitive: true, type: "string", value: null },
				},
				value: {
					primitive: true,
					type: "string",
					value: null,
				},
			},
		],
	});
});

Deno.test("Invalid syntax", () => {
	assertParserFails(Type, "string | number x[][]");
});

Deno.test("Invalid syntax (2)", () => {
	assertParserFails(Type, "string | number[] x");
});
