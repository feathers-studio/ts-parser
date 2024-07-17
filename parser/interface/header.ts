import { assertObjectMatch } from "jsr:@std/assert@1.0.0";
import { many1, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { identifier } from "../identifier.ts";
import { interfaceExtends } from "./extends.ts";
import { assertParser } from "../utils.ts";

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

Deno.test("interfaceHeader: 1", () => {
	assertParser(interfaceHeader, "interface A", { type: "interface-header", name: "A", extends: null });
});

Deno.test("interfaceHeader: 2", () => {
	assertParser(interfaceHeader, "interface A extends  B", { type: "interface-header", name: "A", extends: "B" });
});
