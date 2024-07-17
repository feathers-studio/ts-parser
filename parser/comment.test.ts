import { anyComment, comment } from "./comment.ts";
import { assertParser } from "./utils.ts";

Deno.test("comment.single", () => {
	assertParser(comment.single, "// Hello, World!\n", {
		type: "comment",
		text: " Hello, World!",
		multi: false,
	});
});

Deno.test("comment.multi", () => {
	assertParser(comment.multi, "/* Hello, many\n worlds! */", {
		type: "comment",
		text: " Hello, many\n worlds! ",
		multi: true,
	});
});

Deno.test("anyComment:single", () => {
	assertParser(anyComment, "// Hello, World!\n", {
		type: "comment",
		text: " Hello, World!",
		multi: false,
	});
});

Deno.test("anyComment:multi", () => {
	assertParser(anyComment, "/* Hello, many\n worlds! */", {
		type: "comment",
		text: " Hello, many\n worlds! ",
		multi: true,
	});
});
