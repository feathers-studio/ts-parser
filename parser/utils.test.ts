import { test } from "bun:test";
import { assertParser } from "./test-util.ts";
import { str } from "./arcthird/index.ts";
import { maybeBracketed, quoted } from "./utils.ts";

test("maybeBracketed: 1", () => {
	assertParser(maybeBracketed(str("Hello, World!")), "Hello, World!", "Hello, World!");
});

test("maybeBracketed: 2", () => {
	assertParser(maybeBracketed(str("Hello, World!")), "(Hello, World!)", "Hello, World!");
});

test("maybeBracketed: 3", () => {
	assertParser(maybeBracketed(str("Hello, World!")), "( Hello, World!   )", "Hello, World!");
});

test("maybeBracketed: 4", () => {
	assertParser(maybeBracketed(str("Hello, World!"), "["), "[ Hello, World! ]", "Hello, World!");
});

test("maybeBracketed: 5", () => {
	assertParser(maybeBracketed(str("Hello, World!"), "{"), "{ Hello, World! }", "Hello, World!");
});

test("quoted: 1", () => {
	assertParser(quoted.any, '"Hello, World!"', "Hello, World!", { skipInverse: true });
});

test("quoted: 2", () => {
	assertParser(quoted.any, "'Hello, World!'", "Hello, World!", { skipInverse: true });
});
