import { Identifier } from "./identifier.ts";
import { assertParser } from "./utils.ts";

Deno.test("identifier: 1", () => {
	assertParser(Identifier.parser, "helloWorld", new Identifier("helloWorld"));
});

Deno.test("identifier: 2", () => {
	assertParser(Identifier.parser, "_helloWorld", new Identifier("_helloWorld"));
});

Deno.test("identifier: 3", () => {
	assertParser(Identifier.parser, "$helloWorld", new Identifier("$helloWorld"));
});

Deno.test("identifier: 4", () => {
	assertParser(Identifier.parser, "_$helloWorld", new Identifier("_$helloWorld"));
});

Deno.test("identifier: 5", () => {
	assertParser(Identifier.parser, "helloWorld_", new Identifier("helloWorld_"));
});

Deno.test("identifier: 6", () => {
	assertParser(Identifier.parser, "helloWorld$", new Identifier("helloWorld$"));
});

Deno.test("identifier: 7", () => {
	assertParser(Identifier.parser, "helloWorld0", new Identifier("helloWorld0"));
});

Deno.test("identifier: 8", () => {
	assertParser(Identifier.parser, "helloWorld_0", new Identifier("helloWorld_0"));
});

Deno.test("identifier: 9", () => {
	assertParser(Identifier.parser, "helloWorld$0", new Identifier("helloWorld$0"));
});

Deno.test("identifier: 10", () => {
	assertParser(Identifier.parser, "helloWorld_0$", new Identifier("helloWorld_0$"));
});

Deno.test("identifier: 11", () => {
	assertParser(Identifier.parser, "helloWorld$0_", new Identifier("helloWorld$0_"));
});

Deno.test("identifier: 12", () => {
	assertParser(Identifier.parser, "helloWorld0_", new Identifier("helloWorld0_"));
});

Deno.test("identifier: 13", () => {
	assertParser(Identifier.parser, "helloWorld0$", new Identifier("helloWorld0$"));
});

Deno.test("identifier: 14", () => {
	assertParser(Identifier.parser, "0helloWorld", new Identifier("0helloWorld"), { requireFail: true });
});

Deno.test("identifier: 15", () => {
	assertParser(Identifier.parser, "0_helloWorld", new Identifier("0_helloWorld"), { requireFail: true });
});
