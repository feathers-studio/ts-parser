import { Comment, Directive, Pragma } from "./comment.ts";
import { testParser } from "./utils.ts";

testParser(
	"comment.single", //
	Comment.parser,
	"// Hello, World!\n",
	new Comment(" Hello, World!", false),
);

testParser(
	"comment.multi",
	Comment.parser,
	"/* Hello, many\n worlds! */",
	new Comment(" Hello, many\n worlds! ", true),
);

testParser(
	"comment.directive",
	Comment.parser,
	'/// <reference path="./types.ts" />',
	new Directive("reference", { path: "./types.ts" }),
);

testParser(
	"comment.pragma", //
	Comment.parser,
	"// @ts-check",
	new Pragma("@ts-check"),
);

testParser(
	"comment.pragma.multi", //
	Comment.parser,
	"/* @ts-check */",
	new Pragma("@ts-check", true),
);
