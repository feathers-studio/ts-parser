import { choice, digit, letter, many, Parser, seq, str } from "./arcthird/index.ts";
import { ParserBase, SyntaxKind } from "./base.ts";

// "(_|$|[a-zA-Z])(_|$|[a-zA-Z0-9])+";

const fstChar = choice([str("_"), str("$"), letter]);

export class Identifier extends ParserBase {
	kind: SyntaxKind.Identifier = SyntaxKind.Identifier;

	constructor(public name: string) {
		super();
	}

	static parser: Parser<Identifier> = //
		seq([fstChar, many(choice([fstChar, digit])).map(chars => chars.join(""))])
			.map(([n, d]) => n + d)
			.map(name => new Identifier(name));

	toString() {
		return this.name;
	}
}
