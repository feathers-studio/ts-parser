import { choice, endOfInput, many, anyChar, letter, Parser, possibly, str } from "npm:arcsecond";
import { bw, quoted, seq, wss } from "./utils.ts";
import { ParserBase, SyntaxKind } from "./base.ts";

const pragmaBit = seq([str("@"), letter, many(anyChar)]) //, endOfInput]) //
	.map(([part1, part2, part3]) => [part1, part2, ...part3].join(""));

const pragma = {
	single: seq([possibly(str("/")), wss, pragmaBit]).map(([, , text]) => new Pragma(text.trim())),
	multi: bw(wss)(pragmaBit).map(text => new Pragma(text.trim(), true)),
};

const single = bw(str("//"), choice([str("\n"), endOfInput]))().map(text => new Comment(text, false));
const multi = bw(str("/*"), str("*/"))().map(text => new Comment(text, true));

export class Comment extends ParserBase {
	kind: SyntaxKind.Comment | SyntaxKind.Pragma | SyntaxKind.Directive = SyntaxKind.Comment;

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

export class Pragma extends Comment {
	kind: SyntaxKind.Pragma = SyntaxKind.Pragma;

	constructor(public text: string, public multi: boolean = false) {
		super(text, multi);
	}

	static get parser(): Parser<Pragma> {
		throw new Error("Pragma nodes must be constructed by Comment.parser");
	}

	toString() {
		return this.multi ? `/* ${this.text} */` : `// ${this.text}`;
	}
}

export class Directive extends Comment {
	kind: SyntaxKind.Directive = SyntaxKind.Directive;

	constructor(public name: string, public attr: Record<string, string>) {
		super(name, false);
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
