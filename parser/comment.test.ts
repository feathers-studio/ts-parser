import { Comment } from "./comment.ts";
import { assertParser } from "./utils.ts";

Deno.test("comment.single", () => {
	assertParser(Comment.parser, "// Hello, World!\n", new Comment(" Hello, World!", false));
});

Deno.test("comment.multi", () => {
	assertParser(Comment.parser, "/* Hello, many\n worlds! */", new Comment(" Hello, many\n worlds! ", true));
});
