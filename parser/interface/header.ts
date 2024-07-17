import { many1, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { identifier } from "../identifier.ts";
import { interfaceExtends } from "./extends.ts";

export interface InterfaceHeader {
	type: "interface-header";
	name: string;
	extends: string | null;
}

export const interfaceHeader: Parser<InterfaceHeader> = sequenceOf([
	str("interface"),
	many1(whitespace),
	identifier.map(id => id.value),
	possibly(sequenceOf([many1(whitespace), interfaceExtends.map(id => id.value)]).map(([_, ext]) => ext)),
]).map(([_, __, name, ext]) => ({ type: "interface-header", name, extends: ext }));
