import { Identifier } from "./identifier.ts";
import { assertParser, assertParserFails } from "./utils.ts";

Deno.test("identifier: 1", () => {
	assertParser(Identifier.parse, "helloWorld", Identifier.from("helloWorld"));
});

Deno.test("identifier: 2", () => {
	assertParser(Identifier.parse, "_helloWorld", Identifier.from("_helloWorld"));
});

Deno.test("identifier: 3", () => {
	assertParser(Identifier.parse, "$helloWorld", Identifier.from("$helloWorld"));
});

Deno.test("identifier: 4", () => {
	assertParser(Identifier.parse, "_$helloWorld", Identifier.from("_$helloWorld"));
});

Deno.test("identifier: 5", () => {
	assertParser(Identifier.parse, "helloWorld_", Identifier.from("helloWorld_"));
});

Deno.test("identifier: 6", () => {
	assertParser(Identifier.parse, "helloWorld$", Identifier.from("helloWorld$"));
});

Deno.test("identifier: 7", () => {
	assertParser(Identifier.parse, "helloWorld0", Identifier.from("helloWorld0"));
});

Deno.test("identifier: 8", () => {
	assertParser(Identifier.parse, "helloWorld_0", Identifier.from("helloWorld_0"));
});

Deno.test("identifier: 9", () => {
	assertParser(Identifier.parse, "helloWorld$0", Identifier.from("helloWorld$0"));
});

Deno.test("identifier: 10", () => {
	assertParser(Identifier.parse, "helloWorld_0$", Identifier.from("helloWorld_0$"));
});

Deno.test("identifier: 11", () => {
	assertParser(Identifier.parse, "helloWorld$0_", Identifier.from("helloWorld$0_"));
});

Deno.test("identifier: 12", () => {
	assertParserFails(Identifier.parse, "0helloWorld");
});

Deno.test("identifier: 13", () => {
	assertParserFails(Identifier.parse, "hello-World");
});
