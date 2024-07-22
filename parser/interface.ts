import { optionalWhitespace, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { type DocString, docString } from "./docString.ts";
import { Member, ObjectType, Type } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { MaybeExtends } from "./extends.ts";

export interface InterfaceHeader {
	type: "interface-header";
	name: string;
	extends: Type[] | null;
}

export const InterfaceHeader: Parser<InterfaceHeader> = sequenceOf([
	str("interface"),
	whitespace,
	MaybeExtends(Identifier),
]).map(([, , id]) => ({ ...id, type: "interface-header" }));

export interface InterfaceDeclaration {
	type: "interface";
	doc: DocString | null;
	name: string;
	extends: Type[] | null;
	members: Member[];
}

export const InterfaceDeclaration: Parser<InterfaceDeclaration> = sequenceOf([
	possibly(docString),
	optionalWhitespace,
	InterfaceHeader,
	optionalWhitespace,
	ObjectType,
]).map(([doc, , header, , object]) => ({
	type: "interface",
	doc,
	name: header.name,
	extends: header.extends,
	members: object.members,
}));
