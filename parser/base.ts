import { Parser } from "npm:arcsecond";

export abstract class ParserBase {
	static from(...inputs: unknown[]): unknown {
		throw new Error("Method not implemented.");
	}

	static get parse(): Parser<any> {
		throw new Error("Method not implemented.");
	}

	abstract toString(): string;
}
