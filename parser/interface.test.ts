import { assertParser } from "./utils.ts";
import { InterfaceHeader, InterfaceDeclaration } from "./interface.ts";

Deno.test("InterfaceHeader: 1", () => {
	assertParser(InterfaceHeader, "interface A", { type: "interface-header", name: "A", extends: null });
});

Deno.test("InterfaceHeader: 2", () => {
	assertParser(InterfaceHeader, "interface A extends  B", {
		type: "interface-header",
		name: "A",
		extends: [
			{
				type: "type-reference",
				name: { type: "identifier", name: "B" },
				typeArguments: null,
			},
		],
	});
});

Deno.test("InterfaceDeclaration: 1", () => {
	assertParser(
		InterfaceDeclaration,
		`interface Hello extends World {
		readonly hello ? : World;
		readonly hello : "World";
	}`,
		{
			type: "interface",
			doc: null,
			name: "Hello",
			extends: [
				{
					type: "type-reference",
					name: { type: "identifier", name: "World" },
					typeArguments: null,
				},
			],
			members: [
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					key: { type: "identifier", name: "hello" },
					optional: true,
					value: { type: "type-reference", name: { type: "identifier", name: "World" }, typeArguments: null },
				},
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					key: { type: "identifier", name: "hello" },
					optional: false,
					value: { primitive: true, type: "string", value: "World" },
				},
			],
		},
	);
});

Deno.test("InterfaceDeclaration: 2", () => {
	assertParser(
		InterfaceDeclaration,
		`interface Hello {
		readonly hello ? : World;
		readonly hello : "World"
	}`,
		{
			type: "interface",
			doc: null,
			name: "Hello",
			extends: null,
			members: [
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					optional: true,
					key: { type: "identifier", name: "hello" },
					value: { type: "type-reference", name: { type: "identifier", name: "World" }, typeArguments: null },
				},
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					optional: false,
					key: { type: "identifier", name: "hello" },
					value: { primitive: true, type: "string", value: "World" },
				},
			],
		},
	);
});
