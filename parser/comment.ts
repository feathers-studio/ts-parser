import { choice, endOfInput, many, anyChar, letter, Parser, possibly, str } from "npm:arcsecond";
import { assertParser, bw, quoted, seq, wss } from "./utils.ts";
import { ParserBase } from "./base.ts";

export class Directive extends ParserBase {
	type: "directive" = "directive";

	constructor(public name: string, public attr: Record<string, string>) {
		super();
	}

	// / <reference path="..." />
	static parser: Parser<Directive> = seq([
		seq([str("/"), wss, str("<"), wss, str("reference"), wss]),
		choice([str("path"), str("types"), str("lib"), str("no-default-lib")]),
		seq([wss, str("="), wss]),
		quoted.double,
		seq([wss, str("/>")]),
	]).map(([, type, , path]) => new Directive("reference", { [type]: decodeURIComponent(path) }));

	toString() {
		let out = "/// <" + this.name;
		for (const key in this.attr) {
			const value = this.attr[key];
			out += ` ${key}="${value}"`;
		}
		return out + " />";
	}
}

const pragmaBit = seq([str("@"), letter, many(anyChar)]) //, endOfInput]) //
	.map(([part1, part2, part3]) => [part1, part2, ...part3].join(""));

const pragma = {
	single: seq([possibly(str("/")), wss, pragmaBit]).map(([, , text]) => new Pragma(text.trim())),
	multi: bw(wss)(pragmaBit).map(text => new Pragma(text.trim(), true)),
};

export class Pragma extends ParserBase {
	type: "pragma" = "pragma";

	constructor(public text: string, public multi: boolean = false) {
		super();
	}

	static get parser(): Parser<Pragma> {
		throw new Error("Pragma nodes must be constructed by Comment.parser");
	}

	toString() {
		return this.multi ? `/* @${this.text} */` : `// @${this.text}`;
	}
}

const single = bw(str("//"), choice([str("\n"), endOfInput]))().map(text => new Comment(text, false));
const multi = bw(str("/*"), str("*/"))().map(text => new Comment(text, true));

export class Comment extends ParserBase {
	type: "comment" = "comment";

	constructor(public text: string, public multi: boolean = false) {
		super();
	}

	static parser: Parser<Comment | Pragma | Directive> = choice([single, multi]).map(comment => {
		if (comment.multi) {
			const p = pragma.multi.run(comment.text);
			if (!p.isError) return p.result;
		} else {
			const dir = Directive.parser.run(comment.text);
			if (!dir.isError) return dir.result;
			else {
				const p = pragma.single.run(comment.text);
				if (!p.isError) return p.result;
			}
		}

		return comment;
	});

	toString() {
		return this.multi ? `/*${this.text}*/` : `//${this.text}`;
	}
}

assertParser(Comment.parser, '/// <reference path="./types.ts" />', new Directive("reference", { path: "./types.ts" }));
