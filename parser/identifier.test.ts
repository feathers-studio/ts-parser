import { Identifier } from "./identifier.ts";
import { assertParser, assertParserFails } from "./utils.ts";

Deno.test("identifier: 1", () => {
	assertParser(Identifier, "helloWorld", { type: "identifier", name: "helloWorld" });
});

Deno.test("identifier: 2", () => {
	assertParser(Identifier, "_helloWorld", { type: "identifier", name: "_helloWorld" });
});

Deno.test("identifier: 3", () => {
	assertParser(Identifier, "$helloWorld", { type: "identifier", name: "$helloWorld" });
});

Deno.test("identifier: 4", () => {
	assertParser(Identifier, "_$helloWorld", { type: "identifier", name: "_$helloWorld" });
});

Deno.test("identifier: 5", () => {
	assertParser(Identifier, "helloWorld_", { type: "identifier", name: "helloWorld_" });
});

Deno.test("identifier: 6", () => {
	assertParser(Identifier, "helloWorld$", { type: "identifier", name: "helloWorld$" });
});

Deno.test("identifier: 7", () => {
	assertParser(Identifier, "helloWorld0", { type: "identifier", name: "helloWorld0" });
});

Deno.test("identifier: 8", () => {
	assertParser(Identifier, "helloWorld_0", { type: "identifier", name: "helloWorld_0" });
});

Deno.test("identifier: 9", () => {
	assertParser(Identifier, "helloWorld$0", { type: "identifier", name: "helloWorld$0" });
});

Deno.test("identifier: 10", () => {
	assertParser(Identifier, "helloWorld_0$", { type: "identifier", name: "helloWorld_0$" });
});

Deno.test("identifier: 11", () => {
	assertParser(Identifier, "helloWorld$0_", { type: "identifier", name: "helloWorld$0_" });
});

Deno.test("identifier: 12", () => {
	assertParserFails(Identifier, "0helloWorld");
});

Deno.test("identifier: 13", () => {
	assertParserFails(Identifier, "hello-World");
});
