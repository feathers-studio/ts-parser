import { choice, endOfInput, many, anyChar, letter, Parser, possibly, str } from "./deps/arcsecond.ts";
import { bw, quoted, seq, wss } from "./utils.ts";
import { ParserBase, SyntaxKind } from "./base.ts";

export class Comment extends ParserBase {
	kind: SyntaxKind.Comment = SyntaxKind.Comment;

	constructor(public text: string, public multi: boolean = false) {
		super();
	}

	static single = bw(str("//"), choice([str("\n"), endOfInput]))().map(text => new Comment(text, false));
	static multi = bw(str("/*"), str("*/"))().map(text => new Comment(text, true));

	static parser: Parser<Comment | Pragma | Directive> = choice([Comment.single, Comment.multi]).map(comment => {
		if (comment.multi) {
			const p = Pragma.multi.run(comment.text);
			if (!p.isError) return p.result;
		} else {
			const dir = Directive.parser.run(comment.text);
			if (!dir.isError) return dir.result;
			else {
				const p = Pragma.single.run(comment.text);
				if (!p.isError) return p.result;
			}
		}

		return comment;
	});

	toString() {
		return this.multi ? `/*${this.text}*/` : `//${this.text}`;
	}
}

const pragmaBit = seq([str("@"), letter, many(anyChar)]) //
	.map(([part1, part2, part3]) => [part1, part2, ...part3].join(""));

export class Pragma extends ParserBase {
	kind: SyntaxKind.Pragma = SyntaxKind.Pragma;

	constructor(public text: string, public multi: boolean = false) {
		super();
	}

	static single = seq([possibly(str("/")), wss, pragmaBit]).map(([, , text]) => new Pragma(text.trim()));
	static multi = bw(wss)(pragmaBit).map(text => new Pragma(text.trim(), true));

	static parser = Comment.parser;

	toString() {
		return this.multi ? `/* ${this.text} */` : `// ${this.text}`;
	}
}

export class Directive extends ParserBase {
	kind: SyntaxKind.Directive = SyntaxKind.Directive;

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
