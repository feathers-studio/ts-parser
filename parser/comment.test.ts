import { Comment, Directive, Pragma } from "./comment.ts";
import { assertParser } from "./utils.ts";

Deno.test("comment.single", () => {
	assertParser(Comment.parser, "// Hello, World!\n", new Comment(" Hello, World!", false));
});

Deno.test("comment.multi", () => {
	assertParser(Comment.parser, "/* Hello, many\n worlds! */", new Comment(" Hello, many\n worlds! ", true));
});

Deno.test("comment.directive", () => {
	assertParser(
		Comment.parser,
		'/// <reference path="./types.ts" />',
		new Directive("reference", { path: "./types.ts" }),
	);
});

Deno.test("comment.pragma", () => {
	assertParser(Comment.parser, "// @ts-check", new Pragma("@ts-check"));
});

Deno.test("comment.pragma.multi", () => {
	assertParser(Comment.parser, "/* @ts-check */", new Pragma("@ts-check", true));
});
