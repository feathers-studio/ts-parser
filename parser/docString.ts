import { Parser, str } from "npm:arcsecond";
import { bw } from "./utils.ts";

export class DocString {
	type: "docString" = "docString";

	private constructor(public doc: string) {}

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
