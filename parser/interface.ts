import { optionalWhitespace, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { DocString } from "./docString.ts";
import { Member, ObjectType, Type } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { MaybeExtends } from "./extends.ts";
import { ParserBase } from "./base.ts";

export class InterfaceHeader extends ParserBase {
	type: "interface-header" = "interface-header";

	extends: Type[] | null;

	private constructor(public name: string, ext?: Type[] | null) {
		super();
		this.extends = ext ?? null;
	}

	static from(name: string, ext?: Type[] | null) {
		return new InterfaceHeader(name, ext);
	}

	static get parse(): Parser<InterfaceHeader> {
		return sequenceOf([str("interface"), whitespace, MaybeExtends(Identifier.parse)]).map(
			([, , id]) => new InterfaceHeader(id.name, id.extends),
		);
	}

	toString() {
		return `interface ${this.name}${this.extends ? ` extends ${this.extends.join(", ")}` : ""}`;
	}
}

export class InterfaceDeclaration extends ParserBase {
	type: "interface" = "interface";

	extends: Type[] | null;
	doc: DocString | null;

	private constructor(
		public name: string,
		public members: Member[],
		extra?: {
			extends?: Type[] | null;
			doc?: DocString | null;
		},
	) {
		super();
		this.extends = extra?.extends ?? null;
		this.doc = extra?.doc ?? null;
	}

	static from(
		name: string,
		members: Member[],
		extra?: {
			extends?: Type[] | null;
			doc?: DocString | null;
		},
	) {
		return new InterfaceDeclaration(name, members, extra);
	}

	static get parse(): Parser<InterfaceDeclaration> {
		return sequenceOf([
			possibly(DocString.parse),
			optionalWhitespace,
			InterfaceHeader.parse,
			optionalWhitespace,
			ObjectType.parse,
		]).map(
			([doc, , header, , object]) =>
				new InterfaceDeclaration(header.name, object.members, { extends: header.extends, doc }),
		);
	}

	toString() {
		return `${this.doc ? this.doc + "\n" : ""}interface ${this.name}${
			this.extends ? ` extends ${this.extends.join(", ")}` : ""
		} { ${this.members.join("\n")} }`;
	}
}
