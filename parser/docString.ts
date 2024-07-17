import { Parser, str } from "npm:arcsecond";
import { assertParser, bw } from "./utils.ts";

export interface DocString {
	type: "docString";
	doc: string;
}

export const docString: Parser<DocString> = bw(str("/**"), str("*/"))().map(doc => ({ type: "docString", doc }));

Deno.test("docString", () => {
	assertParser(docString, "/** Hello, World! */", { type: "docString", doc: " Hello, World! " });
});
