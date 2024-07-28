import { test } from "bun:test";
import { assertParser } from "./test-util.ts";
import { Comment, Directive, Pragma } from "./comment.ts";

test("comment.single", () => {
	assertParser(
		Comment.parser, //
		"// Hello, World!\n",
		new Comment(" Hello, World!", false),
	);
});

test("comment.multi", () => {
	assertParser(
		Comment.parser, //
		"/* Hello, many\n worlds! */",
		new Comment(" Hello, many\n worlds! ", true),
	);
});

test("comment.directive", () => {
	assertParser(
		Comment.parser,
		'/// <reference path="./types.ts" />',
		new Directive("reference", { path: "./types.ts" }),
	);
});

test("comment.pragma", () => {
	//
	assertParser(
		Comment.parser, //
		"// @ts-check",
		new Pragma("@ts-check"),
	);
});

test("comment.pragma.multi", () => {
	//
	assertParser(
		Comment.parser, //
		"/* @ts-check */",
		new Pragma("@ts-check", true),
	);
});
