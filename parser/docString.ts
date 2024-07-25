import { Parser, str } from "npm:arcsecond";
import { bw } from "./utils.ts";
import { ParserBase } from "./base.ts";

export class DocString extends ParserBase {
	type: "docString" = "docString";

	constructor(public text: string) {
		super();
	}

	static parser: Parser<DocString> = bw(str("/**"), str("*/"))().map(doc => new DocString(doc));

	toString() {
		return `/**${this.text}*/`;
	}
}
