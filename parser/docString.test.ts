import { DocString } from "./docString.ts";
import { assertParser } from "./test-util.ts";
import { test } from "bun:test";

test("docString", () => {
	assertParser(
		DocString.parser, //
		"/** Hello, World! */",
		new DocString(" Hello, World! "),
	);
});
