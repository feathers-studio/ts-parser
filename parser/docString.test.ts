import { DocString } from "./docString.ts";
import { assertParser } from "./utils.ts";

Deno.test("docString", () => {
	assertParser(
		DocString.parser, //
		"/** Hello, World! */",
		new DocString(" Hello, World! "),
	);
});
