import { DocString } from "./docString.ts";
import { assertParser } from "./utils.ts";

Deno.test("docString", () => {
	assertParser(DocString.parse, "/** Hello, World! */", DocString.from(" Hello, World! "));
});
