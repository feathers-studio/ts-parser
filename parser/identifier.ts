import { choice, digit, letter, many, Parser, sequenceOf, str } from "npm:arcsecond";
import { ParserBase } from "./base.ts";

// "(_|$|[a-zA-Z])(_|$|[a-zA-Z0-9])+";

const fstChar = choice([str("_"), str("$"), letter]);

export class Identifier extends ParserBase {
	type: "identifier" = "identifier";
	constructor(public name: string) {
		super();
	}

	static parser: Parser<Identifier> = //
		sequenceOf([fstChar, many(choice([fstChar, digit])).map(chars => chars.join(""))])
			.map(([n, d]) => n + d)
			.map(name => new Identifier(name));

	toString() {
		return this.name;
	}
}
