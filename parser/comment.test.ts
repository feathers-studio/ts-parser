import { Comment } from "./comment.ts";
import { assertParser } from "./utils.ts";

Deno.test("comment.single", () => {
	assertParser(Comment.parse, "// Hello, World!\n", Comment.single(" Hello, World!"));
});

Deno.test("comment.multi", () => {
	assertParser(Comment.parse, "/* Hello, many\n worlds! */", Comment.multi(" Hello, many\n worlds! "));
});
