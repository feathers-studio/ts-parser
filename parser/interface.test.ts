import { testParser } from "./utils.ts";
import { InterfaceDeclaration } from "./interface.ts";
import { PropertySignature, TypeReference } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";
import { DocString } from "./docString.ts";

testParser(
	"InterfaceDeclaration: 1",
	InterfaceDeclaration.parser,
	`interface Hello extends World {
		readonly hello ? : World;
		readonly hello : "World";
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
		{ extends: [new TypeReference(new Identifier("World"))] },
	),
);

testParser(
	"InterfaceDeclaration: 2",
	InterfaceDeclaration.parser,
	`interface Hello {
		readonly hello ? : World;
		readonly hello : "World"
	}`,
	new InterfaceDeclaration("Hello", [
		new PropertySignature(new Identifier("hello"), new TypeReference(new Identifier("World")), {
			modifiers: ["readonly"],
			optional: true,
		}),
		new PropertySignature(new Identifier("hello"), new Literal.StringType("World"), {
			modifiers: ["readonly"],
			optional: false,
		}),
	]),
);

testParser(
	"InterfaceDeclaration: Exported and Documented",
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
