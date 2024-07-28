import { test } from "bun:test";
import { assertParser } from "./test-util.ts";

import { InterfaceDeclaration, VariableDeclaration, VariableKind, VariableStatement } from "./interface.ts";
import { PropertySignature, TypeReference } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";
import { DocString } from "./docString.ts";

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
		`/** doc
	*/
		export    interface Hello {
		readonly hello ? : World;
		readonly hello : "World"
	}`,
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
				doc: new DocString(" doc\n\t"),
				exported: true,
			},
		),
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
