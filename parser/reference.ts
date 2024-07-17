import { Parser, str } from "npm:arcsecond";
import { assertParser, bw, quoted } from "./utils.ts";

export interface Reference {
	type: "reference";
	path: string;
}

/* /// <reference path="./iterable.d.ts" /> */
export const reference: Parser<Reference> = bw(
	str("/// <reference path="),
	str(" />"),
)(quoted).map(path => ({ type: "reference", path }));

Deno.test("reference", () => {
	assertParser(reference, '/// <reference path="./iterable.d.ts" />', { type: "reference", path: "./iterable.d.ts" });
});
