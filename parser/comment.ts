import { choice, Parser, str } from "npm:arcsecond";
import { bw } from "./utils.ts";
import { ParserBase } from "./base.ts";

const single = bw(str("//"), str("\n"))().map(text => Comment.single(text));
const multi = bw(str("/*"), str("*/"))().map(text => Comment.multi(text));

export class Comment extends ParserBase {
	type: "comment" = "comment";

	private constructor(public text: string, public multi: boolean) {
		super();
	}

	static single(text: string) {
		return new Comment(text, false);
	}

	static multi(text: string) {
		return new Comment(text, true);
	}

	static get parse(): Parser<Comment> {
		return choice([single, multi]);
	}

	toString() {
		return this.multi ? `/*${this.text}*/` : `//${this.text}`;
	}
}
