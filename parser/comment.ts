import { choice, Parser, str } from "npm:arcsecond";
import { assertParser, bw } from "./utils.ts";

export interface Comment {
	type: "comment";
	text: string;
	multi: boolean;
}

export const comment: {
	single: Parser<Comment>;
	multi: Parser<Comment>;
} = {
	single: bw(str("//"), str("\n"))().map(text => ({ type: "comment", text, multi: false })),
	multi: bw(str("/*"), str("*/"))().map(text => ({ type: "comment", text, multi: true })),
};

export const anyComment: Parser<Comment> = choice([comment.single, comment.multi]);

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
