import { test } from "bun:test";
import { assertParser } from "./test-util.ts";

import {
	InterfaceDeclaration,
	TypeDeclaration,
	VariableDeclaration,
	VariableKind,
	VariableStatement,
} from "./statements.ts";
import {
	FunctionType,
	Generic,
	IndexedAccessType,
	KeyOfOperator,
	MethodSignature,
	Parameter,
	PropertySignature,
	TypeReference,
	UnionType,
} from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";
import { DocString } from "./docString.ts";
import { Predefined } from "./predefined.ts";

test("InterfaceDeclaration: 1", () => {
	assertParser(
		InterfaceDeclaration.parser,
		`interface Hello extends World {
		readonly foo ? : World;
		readonly bar : "World";
	}`,
		new InterfaceDeclaration(
			"Hello",
			[
				new PropertySignature(new Identifier("foo"), new TypeReference(new Identifier("World")), {
					modifiers: ["readonly"],
					optional: true,
				}),
				new PropertySignature(new Identifier("bar"), new Literal.StringType("World"), {
					modifiers: ["readonly"],
					optional: false,
				}),
			],
			{ extends: [new TypeReference(new Identifier("World"))] },
		),
	);
});

test("InterfaceDeclaration: 2", () => {
	assertParser(
		InterfaceDeclaration.parser,
		`interface Hello {
		readonly foo ? : World;
		readonly bar : "World"
		readonly public private protected baz: "wOrLd"
	}`,
		new InterfaceDeclaration("Hello", [
			new PropertySignature(new Identifier("foo"), new TypeReference(new Identifier("World")), {
				modifiers: ["readonly"],
				optional: true,
			}),
			new PropertySignature(new Identifier("bar"), new Literal.StringType("World"), {
				modifiers: ["readonly"],
				optional: false,
			}),
			new PropertySignature(new Identifier("baz"), new Literal.StringType("wOrLd"), {
				modifiers: ["readonly", "public", "private", "protected"],
				optional: false,
			}),
		]),
	);
});

test("InterfaceDeclaration: Exported and Documented", () => {
	assertParser(
		InterfaceDeclaration.parser,
		`
/**
	doc
*/
		export    interface Hello {
		readonly hello ? : World;
		readonly hello : "World"
	}`.trim(),
		new InterfaceDeclaration(
			"Hello",
			[
				new PropertySignature(new Identifier("hello"), new TypeReference(new Identifier("World")), {
					modifiers: ["readonly"],
					optional: true,
				}),
				new PropertySignature(new Identifier("hello"), new Literal.StringType("World"), {
					modifiers: ["readonly"],
					optional: false,
				}),
			],
			{
				doc: new DocString("\n\tdoc\n"),
				exported: true,
			},
		),
	);
});

test("InterfaceDeclaration: Real use", () => {
	assertParser(
		InterfaceDeclaration.parser,
		`/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation) */
		interface CSSAnimation extends Animation {
			/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation/animationName) */
			readonly animationName: string;
			addEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
			addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
		}`,
		new InterfaceDeclaration(
			"CSSAnimation",
			[
				new PropertySignature(
					new Identifier("animationName"), //
					new Predefined.StringType(),
					{
						modifiers: ["readonly"],
						doc: new DocString(
							" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation/animationName) ",
						),
					},
				),
				new MethodSignature(
					new Identifier("addEventListener"),
					[
						new Parameter(new Identifier("type"), new TypeReference(new Identifier("K"))),
						new Parameter(
							new Identifier("listener"),
							new FunctionType(
								[
									new Parameter(
										new Identifier("this"), //
										new TypeReference(new Identifier("CSSAnimation")),
									),
									new Parameter(
										new Identifier("ev"), //
										new IndexedAccessType(
											new Identifier("AnimationEventMap"),
											new TypeReference(new Identifier("K")),
										),
									),
								],
								new Predefined.AnyType(),
							),
						),
						new Parameter(
							new Identifier("options"),
							new UnionType([
								new Predefined.BooleanType(),
								new TypeReference(new Identifier("AddEventListenerOptions")),
							]),
							{ optional: true },
						),
					],
					new Predefined.VoidType(),
					{
						generics: [
							new Generic(
								new Identifier("K"),
								new KeyOfOperator(new TypeReference(new Identifier("AnimationEventMap"))),
							),
						],
					},
				),
				new MethodSignature(
					new Identifier("addEventListener"),
					[
						new Parameter(new Identifier("type"), new Predefined.StringType()),
						new Parameter(
							new Identifier("listener"),
							new TypeReference(new Identifier("EventListenerOrEventListenerObject")),
						),
						new Parameter(
							new Identifier("options"),
							new UnionType([
								new Predefined.BooleanType(),
								new TypeReference(new Identifier("AddEventListenerOptions")),
							]),
							{ optional: true },
						),
					],
					new Predefined.VoidType(),
				),
			],
			{
				extends: [new TypeReference(new Identifier("Animation"))],
				doc: new DocString(" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation) "),
			},
		),
	);
});

test("InterfaceDeclaration: Real use 2", () => {
	assertParser(
		InterfaceDeclaration.parser,
		`interface CredentialsContainer {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/create) */
    create(options?: CredentialCreationOptions): Promise<Credential | null>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/get) */
    get(options?: CredentialRequestOptions): Promise<Credential | null>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/preventSilentAccess) */
    preventSilentAccess(): Promise<void>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/store) */
    store(credential: Credential): Promise<void>;
}`.trim(),
		new InterfaceDeclaration("CredentialsContainer", [
			new MethodSignature(
				new Identifier("create"),
				[
					new Parameter(
						new Identifier("options"),
						new TypeReference(new Identifier("CredentialCreationOptions")),
						{ optional: true },
					),
				],
				new TypeReference(new Identifier("Promise"), [
					new UnionType([new TypeReference(new Identifier("Credential")), new Literal.NullType()]),
				]),
				{
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/create) ",
					),
				},
			),
			new MethodSignature(
				new Identifier("get"),
				[
					new Parameter(
						new Identifier("options"),
						new TypeReference(new Identifier("CredentialRequestOptions")),
						{ optional: true },
					),
				],
				new TypeReference(new Identifier("Promise"), [
					new UnionType([new TypeReference(new Identifier("Credential")), new Literal.NullType()]),
				]),
				{
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/get) ",
					),
				},
			),
			new MethodSignature(
				new Identifier("preventSilentAccess"),
				[],
				new TypeReference(new Identifier("Promise"), [new Predefined.VoidType()]),
				{
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/preventSilentAccess) ",
					),
				},
			),
			new MethodSignature(
				new Identifier("store"),
				[new Parameter(new Identifier("credential"), new TypeReference(new Identifier("Credential")))],
				new TypeReference(new Identifier("Promise"), [new Predefined.VoidType()]),
				{
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CredentialsContainer/store) ",
					),
				},
			),
		]),
	);
});

test("VariableStatement: 1", () => {
	assertParser(
		VariableStatement.parser,
		`declare var hello : World;`,
		new VariableStatement(
			[new VariableDeclaration(new Identifier("hello"), new TypeReference(new Identifier("World")))],
			{ declared: true, kind: VariableKind.Var },
		),
	);
});

test("TypeDeclaration: 1", () => {
	assertParser(
		TypeDeclaration.parser,
		`type Hello = World;`,
		new TypeDeclaration(new Identifier("Hello"), new TypeReference(new Identifier("World"))),
	);
});
