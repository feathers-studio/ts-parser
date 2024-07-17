import { docString } from "./docString.ts";
import { assertParser } from "./utils.ts";

Deno.test("docString", () => {
	assertParser(docString, "/** Hello, World! */", { type: "docString", doc: " Hello, World! " });
});
