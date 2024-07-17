import { assert, assertObjectMatch } from "jsr:@std/assert@1.0.0";
import { choice, digit, letter, many, Parser, sequenceOf, str } from "npm:arcsecond";
import { assertParser, assertParserFails } from "./utils.ts";

// "(_|$|[a-zA-Z])(_|$|[a-zA-Z0-9])+";

const fstChar = choice([str("_"), str("$"), letter]);

export interface Identifier {
	type: "identifier";
	value: string;
}

export const identifier: Parser<Identifier> = //
	sequenceOf([fstChar, many(choice([fstChar, digit])).map(chars => chars.join(""))])
		.map(([n, d]) => n + d)
		.map(str => ({ type: "identifier", value: str }));

Deno.test("identifier: 1", () => {
	assertParser(identifier, "helloWorld", { type: "identifier", value: "helloWorld" });
});

Deno.test("identifier: 2", () => {
	assertParser(identifier, "_helloWorld", { type: "identifier", value: "_helloWorld" });
});

Deno.test("identifier: 3", () => {
	assertParser(identifier, "$helloWorld", { type: "identifier", value: "$helloWorld" });
});

Deno.test("identifier: 4", () => {
	assertParser(identifier, "_$helloWorld", { type: "identifier", value: "_$helloWorld" });
});

Deno.test("identifier: 5", () => {
	assertParser(identifier, "helloWorld_", { type: "identifier", value: "helloWorld_" });
});

Deno.test("identifier: 6", () => {
	assertParser(identifier, "helloWorld$", { type: "identifier", value: "helloWorld$" });
});

Deno.test("identifier: 7", () => {
	assertParser(identifier, "helloWorld0", { type: "identifier", value: "helloWorld0" });
});

Deno.test("identifier: 8", () => {
	assertParser(identifier, "helloWorld_0", { type: "identifier", value: "helloWorld_0" });
});

Deno.test("identifier: 9", () => {
	assertParser(identifier, "helloWorld$0", { type: "identifier", value: "helloWorld$0" });
});

Deno.test("identifier: 10", () => {
	assertParser(identifier, "helloWorld_0$", { type: "identifier", value: "helloWorld_0$" });
});

Deno.test("identifier: 11", () => {
	assertParser(identifier, "helloWorld$0_", { type: "identifier", value: "helloWorld$0_" });
});

Deno.test("identifier: 12", () => {
	assertParserFails(identifier, "0helloWorld");
});

Deno.test("identifier: 13", () => {
	assertParserFails(identifier, "hello-World");
});
