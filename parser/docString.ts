import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { Parser, str } from "npm:arcsecond";
import { bw } from "./utils.ts";

export interface DocString {
	type: "docString";
	doc: string;
}

export const docString: Parser<DocString> = bw(str("/**"), str("*/"))().map(doc => ({ type: "docString", doc }));

Deno.test("docString", () => {
	const result = docString.run("/** Hello, World! */");
	assert(!result.isError);
	assertEquals(result.result.type, "docString");
	assertEquals(result.result.doc, " Hello, World! ");
});
