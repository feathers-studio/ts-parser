import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { Parser, str } from "npm:arcsecond";
import { bw, quoted } from "./utils.ts";

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
	const result = reference.run('/// <reference path="./iterable.d.ts" />');
	assert(!result.isError);
	assertEquals(result.result.type, "reference");
	assertEquals(result.result.path, "./iterable.d.ts");
});
