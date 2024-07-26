import { char, optionalWhitespace, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { DocString } from "./docString.ts";
import { PropertySignature, ObjectType, Type } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { ParserBase, SyntaxKind } from "./base.ts";
import { sepByN, seq, surroundWhitespace } from "./utils.ts";

export class ExportKeyword extends ParserBase {
	kind: SyntaxKind.ExportKeyword = SyntaxKind.ExportKeyword;

	constructor() {
		super();
	}

	static parser = str("export").map(() => new ExportKeyword());

	toString() {
		return "export";
	}
}

export const Extends = sequenceOf([
	whitespace,
	str("extends"),
	whitespace,
	sepByN<Type>(surroundWhitespace(char(",")), 1)(Type),
]) //
	.map(([, , , value]) => ({ extends: value }));

export const MaybeExtends = (parser: Parser<Identifier>): Parser<Identifier & { extends: Type[] | null }> =>
	sequenceOf([parser, possibly(Extends)]) //
		.map(([value, exts]) => ({ ...value, extends: exts ? exts.extends : null }));

const interfaceHeader = sequenceOf([
		possibly(seq([str("export"), whitespace])).map(x => !!x),
		possibly(seq([str("declare"), whitespace])).map(x => !!x),
		str("interface"),
		whitespace,
		MaybeExtends(Identifier.parser),
]).map(([exported, declared, , , id]) => ({ name: id.name, extends: id.extends, exported, declared }));

export class InterfaceDeclaration extends ParserBase {
	kind: SyntaxKind.InterfaceDeclaration = SyntaxKind.InterfaceDeclaration;

	exported: boolean;
	extends: Type[] | null;
	doc: DocString | null;

	constructor(
		public name: string,
		public members: PropertySignature[],
		extra?: {
			exported?: boolean;
			extends?: Type[] | null;
			doc?: DocString | null;
		},
	) {
		super();
		this.exported = extra?.exported ?? false;
		this.extends = extra?.extends ?? null;
		this.doc = extra?.doc ?? null;
	}

	static parser: Parser<InterfaceDeclaration> = sequenceOf([
		possibly(DocString.parser),
		optionalWhitespace,
		interfaceHeader,
		optionalWhitespace,
		ObjectType.parser,
	]).map(
		([doc, , header, , object]) =>
			new InterfaceDeclaration(header.name, object.members, {
				doc,
				extends: header.extends,
				exported: header.exported,
			}),
	);

	toString() {
		let out = "";

		if (this.doc) out += this.doc + "\n";
		if (this.exported) out += "export ";
		out += "interface " + this.name;
		if (this.extends) out += " extends " + this.extends.join(", ");
		out += " {\n";
		out += this.members.map(member => "\t" + member.toString() + ";").join("\n");
		out += "\n}";

		return out;
	}
}
