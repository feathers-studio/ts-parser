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
