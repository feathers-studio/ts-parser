import { char, choice, optionalWhitespace, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { DocString } from "./docString.ts";
import { PropertySignature, ObjectType, Type } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { ParserBase, SyntaxKind } from "./base.ts";
import { sepByN, seq, surroundWhitespace } from "./utils.ts";
import { Comment } from "./comment.ts";

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

export class DeclareKeyword extends ParserBase {
	kind: SyntaxKind.DeclareKeyword = SyntaxKind.DeclareKeyword;

	constructor() {
		super();
	}

	static parser = str("declare").map(() => new DeclareKeyword());

	toString() {
		return "declare";
	}
}

export const Extends = sequenceOf([
	whitespace,
	str("extends"),
	whitespace,
	sepByN(surroundWhitespace(char(",")), 1)(Type),
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
		public members: (PropertySignature | Comment)[],
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
		out += this.members.map(member => "\t" + member.toString()).join("\n");
		out += "\n}";

		return out;
	}
}

export const enum VariableKind {
	Var,
	Let,
	Const,
}

const VariableKindMap = {
	var: VariableKind.Var,
	let: VariableKind.Let,
	const: VariableKind.Const,
};

const VariableKindReverseMap = {
	[VariableKind.Var]: "var",
	[VariableKind.Let]: "let",
	[VariableKind.Const]: "const",
};

export class VariableDeclaration extends ParserBase {
	kind: SyntaxKind.VariableDeclaration = SyntaxKind.VariableDeclaration;

	doc: DocString | null;

	constructor(
		public name: Identifier,
		public type: Type,
		extra?: {
			doc?: DocString | null;
		},
	) {
		super();
		this.doc = extra?.doc ?? null;
	}

	static parser: Parser<VariableDeclaration> = sequenceOf([
		Identifier.parser,
		optionalWhitespace,
		str(":"),
		optionalWhitespace,
		Type,
	]).map(([id, , , , type]) => new VariableDeclaration(id, type));

	toString() {
		return `${this.name}: ${this.type}`;
	}
}

export class VariableStatement extends ParserBase {
	kind: SyntaxKind.VariableStatement = SyntaxKind.VariableStatement;

	doc: DocString | null;
	variableKind: VariableKind = VariableKind.Var;
	exported: boolean;
	declared: boolean;

	constructor(
		public list: VariableDeclaration[],
		extra?: {
			doc?: DocString | null;
			kind: VariableKind;
			exported?: boolean;
			declared?: boolean;
		},
	) {
		super();
		this.doc = extra?.doc ?? null;
		this.variableKind = extra?.kind ?? VariableKind.Var;
		this.exported = extra?.exported ?? false;
		this.declared = extra?.declared ?? false;
	}

	static parser: Parser<VariableStatement> = sequenceOf([
		possibly(seq([str("export"), whitespace])).map(x => !!x),
		possibly(seq([str("declare"), whitespace])).map(x => !!x),
		choice([str("var"), str("let"), str("const")]) as Parser<"var" | "let" | "const">,
		whitespace,
		sepByN(surroundWhitespace(char(",")), 1)(VariableDeclaration.parser),
		possibly(char(";")),
	]).map(
		([exported, declared, kind, , list]) =>
			new VariableStatement(list, { kind: VariableKindMap[kind], exported, declared }),
	);

	toString() {
		let out = "";

		if (this.doc) out += this.doc + "\n";
		if (this.exported) out += "export ";
		if (this.declared) out += "declare ";
		out += VariableKindReverseMap[this.variableKind] + " ";
		out += this.list.map(decl => decl.toString()).join(", ");
		out += ";";

		return out;
	}
}
