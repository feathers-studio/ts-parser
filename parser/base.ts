import { Parser } from "npm:arcsecond";

export abstract class ParserBase {
	static parser: Parser<unknown>;

	abstract toString(): string;
}
