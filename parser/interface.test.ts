import { assertParser } from "./utils.ts";
import { InterfaceHeader, InterfaceDeclaration } from "./interface.ts";
import { Member, TypeReference } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";
import { DocString } from "./docString.ts";

Deno.test("InterfaceHeader: 1", () => {
	assertParser(InterfaceHeader.parser, "interface A", new InterfaceHeader("A"));
});

Deno.test("InterfaceHeader: 2", () => {
	assertParser(
		InterfaceHeader.parser,
		"interface A extends  B",
		new InterfaceHeader("A", { extends: [new TypeReference(new Identifier("B"))] }),
	);
});

Deno.test("InterfaceDeclaration: 1", () => {
	assertParser(
		InterfaceDeclaration.parser,
		`interface Hello extends World {
		readonly hello ? : World;
		readonly hello : "World";
	}`,
		new InterfaceDeclaration(
			"Hello",
			[
				new Member(new Identifier("hello"), new TypeReference(new Identifier("World")), {
					modifiers: ["readonly"],
					optional: true,
				}),
				new Member(new Identifier("hello"), new Literal.StringType("World"), {
					modifiers: ["readonly"],
					optional: false,
				}),
			],
			{ extends: [new TypeReference(new Identifier("World"))] },
		),
	);
});

Deno.test("InterfaceDeclaration: 2", () => {
	assertParser(
		InterfaceDeclaration.parser,
		`interface Hello {
		readonly hello ? : World;
		readonly hello : "World"
	}`,
		new InterfaceDeclaration("Hello", [
			new Member(new Identifier("hello"), new TypeReference(new Identifier("World")), {
				modifiers: ["readonly"],
				optional: true,
			}),
			new Member(new Identifier("hello"), new Literal.StringType("World"), {
				modifiers: ["readonly"],
				optional: false,
			}),
		]),
	);
});

Deno.test("InterfaceDeclaration: Exported and Documented", () => {
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
				new Member(new Identifier("hello"), new TypeReference(new Identifier("World")), {
					modifiers: ["readonly"],
					optional: true,
				}),
				new Member(new Identifier("hello"), new Literal.StringType("World"), {
					modifiers: ["readonly"],
					optional: false,
				}),
			],
			{
				doc: new DocString(" doc\n"),
				exported: true,
			},
		),
	);
});
