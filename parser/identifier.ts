import { choice, digit, letter, many, Parser, sequenceOf, str } from "npm:arcsecond";

// "(_|$|[a-zA-Z])(_|$|[a-zA-Z0-9])+";

const fstChar = choice([str("_"), str("$"), letter]);

export class Identifier {
	type: "identifier" = "identifier";
	constructor(public name: string) {}

	static from(name: string) {
		return new Identifier(name);
	}

	static get parse(): Parser<Identifier> {
		return sequenceOf([fstChar, many(choice([fstChar, digit])).map(chars => chars.join(""))])
			.map(([n, d]) => n + d)
			.map(name => new Identifier(name));
	}

	toString() {
		return this.name;
	}
}
