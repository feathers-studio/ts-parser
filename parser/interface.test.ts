import { testParser } from "./utils.ts";
import { InterfaceHeader, InterfaceDeclaration } from "./interface.ts";
import { Member, TypeReference } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { Literal } from "./literal.ts";
import { DocString } from "./docString.ts";

testParser(
	"InterfaceHeader: 1", //
	InterfaceHeader.parser,
	"interface A",
	new InterfaceHeader("A"),
);

testParser(
	"InterfaceHeader: 2",
	InterfaceHeader.parser,
	"interface A extends  B",
	new InterfaceHeader("A", { extends: [new TypeReference(new Identifier("B"))] }),
);

testParser(
	"InterfaceHeader: 3",
	InterfaceHeader.parser,
	"interface A extends  B, C",
	new InterfaceHeader("A", {
		extends: [new TypeReference(new Identifier("B")), new TypeReference(new Identifier("C"))],
	}),
);

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

testParser(
	"InterfaceDeclaration: 2",
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
			doc: new DocString(" doc\n\t"),
			exported: true,
		},
	),
);
