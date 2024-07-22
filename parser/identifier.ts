import { choice, digit, letter, many, Parser, sequenceOf, str } from "npm:arcsecond";

// "(_|$|[a-zA-Z])(_|$|[a-zA-Z0-9])+";

const fstChar = choice([str("_"), str("$"), letter]);

export interface Identifier {
	type: "identifier";
	name: string;
}

export const Identifier: Parser<Identifier> = //
	sequenceOf([fstChar, many(choice([fstChar, digit])).map(chars => chars.join(""))])
		.map(([n, d]) => n + d)
		.map(name => ({ type: "identifier", name }));
