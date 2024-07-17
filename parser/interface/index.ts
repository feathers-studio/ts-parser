import { many, optionalWhitespace, Parser, possibly, sequenceOf, str } from "npm:arcsecond";
import { assertParser, bw } from "../utils.ts";
import { type DocString, docString } from "../docString.ts";
import { type InterfaceMember, interfaceMember } from "./member.ts";
import { interfaceHeader } from "./header.ts";

export interface Interface {
	type: "interface";
	doc: DocString | null;
	name: string;
	extends: string | null;
	members: InterfaceMember[];
}

export const iface: Parser<Interface> = sequenceOf([
	possibly(docString),
	optionalWhitespace,
	interfaceHeader,
	optionalWhitespace,
	bw(str("{"), str("}"))(many(interfaceMember)),
]).map(([doc, _, header, __, members]) => ({
	type: "interface",
	doc,
	name: header.name,
	extends: header.extends,
	members,
}));

Deno.test("iface: 1", () => {
	assertParser(
		iface,
		`interface Hello extends World {
		readonly hello ? : World;
		readonly hello : "World";
	}`,
		{
			type: "interface",
			doc: null,
			name: "Hello",
			extends: "World",
			members: [
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					name: { type: "identifier", value: "hello" },
					optional: true,
					defn: { type: "identifier", value: "World" },
				},
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					name: { type: "identifier", value: "hello" },
					optional: false,
					defn: { primitive: true, type: "string", value: "World" },
				},
			],
		},
	);
});

Deno.test("iface: 2", () => {
	assertParser(
		iface,
		`interface Hello {
		readonly hello ? : World;
		readonly hello : "World";
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
					name: { type: "identifier", value: "hello" },
					optional: true,
					defn: { type: "identifier", value: "World" },
				},
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					name: { type: "identifier", value: "hello" },
					optional: false,
					defn: { primitive: true, type: "string", value: "World" },
				},
			],
		},
	);
});
