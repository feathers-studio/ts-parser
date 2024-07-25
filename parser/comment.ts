import { choice, Parser, str } from "npm:arcsecond";
import { bw } from "./utils.ts";
import { ParserBase } from "./base.ts";

const single = bw(str("//"), str("\n"))().map(text => new Comment(text, false));
const multi = bw(str("/*"), str("*/"))().map(text => new Comment(text, true));

export class Comment extends ParserBase {
	type: "comment" = "comment";

	multi: boolean;

	constructor(public text: string, multi?: boolean) {
		super();
		this.multi = multi ?? false;
	}

	static parser: Parser<Comment> = choice([single, multi]);

	toString() {
		return this.multi ? `/*${this.text}*/` : `//${this.text}`;
	}
}
