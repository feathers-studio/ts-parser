import { Parser, str } from "./deps/arcsecond.ts";
import { bw } from "./utils.ts";
import { ParserBase, SyntaxKind } from "./base.ts";

export class DocString extends ParserBase {
	kind: SyntaxKind.DocString = SyntaxKind.DocString;

	constructor(public text: string) {
		super();
	}

	static parser: Parser<DocString> = bw(str("/**"), str("*/"))().map(doc => new DocString(doc));

	toString() {
		return `/**${this.text}*/`;
	}
}
