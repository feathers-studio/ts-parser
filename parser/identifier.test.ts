import { Identifier } from "./identifier.ts";
import { assertParser } from "./test-util.ts";
import { test } from "bun:test";

test("identifier: 1", () => {
	assertParser(Identifier.parser, "helloWorld", new Identifier("helloWorld"));
});

test("identifier: 2", () => {
	assertParser(Identifier.parser, "_helloWorld", new Identifier("_helloWorld"));
});

test("identifier: 3", () => {
	assertParser(Identifier.parser, "$helloWorld", new Identifier("$helloWorld"));
});

test("identifier: 4", () => {
	assertParser(Identifier.parser, "_$helloWorld", new Identifier("_$helloWorld"));
});

test("identifier: 5", () => {
	assertParser(Identifier.parser, "helloWorld_", new Identifier("helloWorld_"));
});

test("identifier: 6", () => {
	assertParser(Identifier.parser, "helloWorld$", new Identifier("helloWorld$"));
});

test("identifier: 7", () => {
	assertParser(Identifier.parser, "helloWorld0", new Identifier("helloWorld0"));
});

test("identifier: 8", () => {
	assertParser(Identifier.parser, "helloWorld_0", new Identifier("helloWorld_0"));
});

test("identifier: 9", () => {
	assertParser(Identifier.parser, "helloWorld$0", new Identifier("helloWorld$0"));
});

test("identifier: 10", () => {
	assertParser(Identifier.parser, "helloWorld_0$", new Identifier("helloWorld_0$"));
});

test("identifier: 11", () => {
	assertParser(Identifier.parser, "helloWorld$0_", new Identifier("helloWorld$0_"));
});

test("identifier: 12", () => {
	assertParser(Identifier.parser, "helloWorld0_", new Identifier("helloWorld0_"));
});

test("identifier: 13", () => {
	assertParser(Identifier.parser, "helloWorld0$", new Identifier("helloWorld0$"));
});

test("identifier: 14", () => {
	assertParser(Identifier.parser, "0helloWorld", new Identifier("0helloWorld"), { requireFail: true });
});

test("identifier: 15", () => {
	assertParser(Identifier.parser, "0_helloWorld", new Identifier("0_helloWorld"), { requireFail: true });
});
