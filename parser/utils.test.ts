import { str } from "npm:arcsecond";
import { assertParser, maybeBracketed, quoted } from "./utils.ts";

Deno.test("maybeBracketed: 1", () => {
	assertParser(maybeBracketed(str("Hello, World!")), "Hello, World!", "Hello, World!");
});

Deno.test("maybeBracketed: 2", () => {
	assertParser(maybeBracketed(str("Hello, World!")), "(Hello, World!)", "Hello, World!");
});

Deno.test("maybeBracketed: 3", () => {
	assertParser(maybeBracketed(str("Hello, World!")), "( Hello, World!   )", "Hello, World!");
});

Deno.test("maybeBracketed: 4", () => {
	assertParser(maybeBracketed(str("Hello, World!"), "["), "[ Hello, World! ]", "Hello, World!");
});

Deno.test("maybeBracketed: 5", () => {
	assertParser(maybeBracketed(str("Hello, World!"), "{"), "{ Hello, World! }", "Hello, World!");
});

Deno.test("quoted: 1", () => {
	assertParser(quoted.any, '"Hello, World!"', "Hello, World!", false);
});

Deno.test("quoted: 2", () => {
	assertParser(quoted.any, "'Hello, World!'", "Hello, World!", false);
});
