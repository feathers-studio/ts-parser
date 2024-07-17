import { many, optionalWhitespace, Parser, possibly, sequenceOf, str } from "npm:arcsecond";
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
