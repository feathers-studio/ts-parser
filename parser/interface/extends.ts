import { many1, Parser, sequenceOf, str, whitespace } from "npm:arcsecond";
import { identifier, Identifier } from "../identifier.ts";

export const interfaceExtends: Parser<Identifier> = sequenceOf([str("extends"), many1(whitespace), identifier]) //
	.map(([_, __, id]) => id);
