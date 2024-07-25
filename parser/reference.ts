import { Parser, str } from "npm:arcsecond";
import { bw, quoted } from "./utils.ts";
import { ParserBase } from "./base.ts";

export class Reference extends ParserBase {
	type: "reference" = "reference";

	constructor(public path: string) {
		super();
		this.path = path;
	}

	static parser: Parser<Reference> = //
		bw(str("/// <reference path="), str(" />"))(quoted).map(path => new Reference(path));

	toString() {
		return `/// <reference path="${this.path}" />`;
	}
}
