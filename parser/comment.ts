import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { choice, Parser, str } from "npm:arcsecond";
import { bw } from "./utils.ts";

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
	const result = comment.single.run("// Hello, World!\n");
	assert(!result.isError);
	assertEquals(result.result.type, "comment");
	assertEquals(result.result.text, " Hello, World!");
	assertEquals(result.result.multi, false);
});

Deno.test("comment.multi", () => {
	const result = comment.multi.run(`/* Hello, many\n worlds! */`);
	assert(!result.isError);
	assertEquals(result.result.type, "comment");
	assertEquals(result.result.text, " Hello, many\n worlds! ");
	assertEquals(result.result.multi, true);
});

Deno.test("anyComment:single", () => {
	const result = anyComment.run("// Hello, World!\n");
	assert(!result.isError);
	assertEquals(result.result.type, "comment");
	assertEquals(result.result.text, " Hello, World!");
	assertEquals(result.result.multi, false);
});

Deno.test("anyComment:multi", () => {
	const result = comment.multi.run(`/* Hello, many\n worlds! */`);
	assert(!result.isError);
	assertEquals(result.result.type, "comment");
	assertEquals(result.result.text, " Hello, many\n worlds! ");
	assertEquals(result.result.multi, true);
});
