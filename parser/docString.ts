import { Parser, str } from "npm:arcsecond";
import { bw } from "./utils.ts";
import { ParserBase } from "./base.ts";

export class DocString extends ParserBase {
	type: "docString" = "docString";

	private constructor(public doc: string) {
		super();
	}

	static from(doc: string) {
		return new DocString(doc);
	}

	static get parse(): Parser<DocString> {
		return bw(str("/**"), str("*/"))().map(doc => new DocString(doc));
	}

	toString() {
		return `/**${this.doc}*/`;
	}
}
