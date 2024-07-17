import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { many, optionalWhitespace, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { bw } from "../utils.ts";
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

Deno.test("iface", () => {
	{
		const result = iface.run(`interface Hello extends World {
		readonly hello ? : World;
		readonly hello : "World";
	}`);
		assert(!result.isError);
		assertEquals(result.result.type, "interface");
		assertEquals(result.result.name, "Hello");
		assertEquals(result.result.extends, "World");
		assertEquals(result.result.members.length, 2);
	}

	{
		const result = iface.run(`interface Hello {
		readonly hello ? : World;
		readonly hello : "World";
	}`);
		assert(!result.isError);
		assertEquals(result.result.type, "interface");
		assertEquals(result.result.name, "Hello");
		assertEquals(result.result.extends, null);
		assertEquals(result.result.members.length, 2);
	}
});
