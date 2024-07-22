import { assertParser } from "./utils.ts";
import { InterfaceHeader, InterfaceDeclaration } from "./interface.ts";
import { Member, TypeReference } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";

Deno.test("InterfaceHeader: 1", () => {
	assertParser(InterfaceHeader.parse, "interface A", InterfaceHeader.from("A", null));
});

Deno.test("InterfaceHeader: 2", () => {
	assertParser(
		InterfaceHeader.parse,
		"interface A extends  B",
		InterfaceHeader.from("A", [TypeReference.from(Identifier.from("B"))]),
	);
});

Deno.test("InterfaceDeclaration: 1", () => {
	assertParser(
		InterfaceDeclaration.parse,
		`interface Hello extends World {
		readonly hello ? : World;
		readonly hello : "World";
	}`,
		InterfaceDeclaration.from(
			"Hello",
			[
				Member.from(Identifier.from("hello"), TypeReference.from(Identifier.from("World")), {
					modifier: ["readonly"],
					optional: true,
				}),
				Member.from(Identifier.from("hello"), Literal.String.from("World"), {
					modifier: ["readonly"],
					optional: false,
				}),
			],
			{ extends: [TypeReference.from(Identifier.from("World"))] },
		),
	);
});

Deno.test("InterfaceDeclaration: 2", () => {
	assertParser(
		InterfaceDeclaration.parse,
		`interface Hello {
		readonly hello ? : World;
		readonly hello : "World"
	}`,
		InterfaceDeclaration.from("Hello", [
			Member.from(Identifier.from("hello"), TypeReference.from(Identifier.from("World")), {
				modifier: ["readonly"],
				optional: true,
			}),
			Member.from(Identifier.from("hello"), Literal.String.from("World"), {
				modifier: ["readonly"],
				optional: false,
			}),
		]),
	);
});
