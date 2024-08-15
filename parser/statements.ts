import {
	char,
	choice,
	many,
	optionalWhitespace,
	Parser,
	possibly,
	seq,
	str,
	recursive,
	whitespace,
} from "./arcthird/index.ts";
import { DocString } from "./docString.ts";
import { TypeLiteral, Type, GenericList, Generic, ParameterList, RestParameter, Parameter } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { ParserBase, SyntaxKind } from "./base.ts";
import { left, nonNull, sepByN, surroundWhitespace, ws } from "./utils.ts";
import { Comment, Directive, Pragma } from "./comment.ts";

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

export const Extends = seq([whitespace, str("extends"), whitespace, sepByN(surroundWhitespace(char(",")), 1)(Type)]) //
	.map(([, , , value]) => ({ extends: value }));

const interfaceHeader = seq([
	possibly(seq([str("export"), whitespace])).map(x => !!x),
	possibly(seq([str("declare"), whitespace])).map(x => !!x),
	str("interface"),
	whitespace,
	Identifier.parser,
	possibly(GenericList),
	possibly(Extends),
]).map(([exported, declared, , , id, generics, extending]) => ({
	name: id.name,
	generics: generics ?? [],
	extends: extending?.extends,
	exported,
	declared,
}));

export class InterfaceDeclaration extends ParserBase {
	kind: SyntaxKind.InterfaceDeclaration = SyntaxKind.InterfaceDeclaration;

	exported: boolean;
	generics: Generic[];
	extends: Type[] | null;
	doc: DocString | null;

	constructor(
		public name: string,
		public members: TypeLiteral["members"],
		extra?: {
			exported?: boolean;
			generics?: Generic[];
			extends?: Type[] | null;
			doc?: DocString | null;
		},
	) {
		super();
		this.exported = extra?.exported ?? false;
		this.generics = extra?.generics ?? [];
		this.extends = extra?.extends ?? null;
		this.doc = extra?.doc ?? null;
	}

	static parser: Parser<InterfaceDeclaration> = seq([
		possibly(DocString.parser),
		optionalWhitespace,
		interfaceHeader,
		optionalWhitespace,
		TypeLiteral.parser,
	]).map(
		([doc, , header, , object]) =>
			new InterfaceDeclaration(header.name, object.members, {
				doc,
				generics: header.generics,
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

	static parser: Parser<VariableDeclaration> = seq([
		possibly(DocString.parser),
		optionalWhitespace,
		Identifier.parser,
		optionalWhitespace,
		str(":"),
		optionalWhitespace,
		Type,
	]).map(([doc, , id, , , , type]) => new VariableDeclaration(id, type, { doc }));

	toString() {
		let out = "";
		if (this.doc) out += this.doc + "\n";
		out += this.name + ": " + this.type;
		return out;
	}
}

export class VariableStatement extends ParserBase {
	kind: SyntaxKind.VariableStatement = SyntaxKind.VariableStatement;

	variableKind: VariableKind = VariableKind.Var;
	exported: boolean;
	declared: boolean;

	constructor(
		public list: VariableDeclaration[],
		extra?: {
			kind: VariableKind;
			exported?: boolean;
			declared?: boolean;
		},
	) {
		super();
		this.variableKind = extra?.kind ?? VariableKind.Var;
		this.exported = extra?.exported ?? false;
		this.declared = extra?.declared ?? false;
	}

	static parser: Parser<VariableStatement> = seq([
		possibly(DocString.parser),
		optionalWhitespace,
		possibly(seq([str("export"), whitespace])).map(x => !!x),
		possibly(seq([str("declare"), whitespace])).map(x => !!x),
		choice([str("var"), str("let"), str("const")]) as Parser<"var" | "let" | "const">,
		whitespace,
		sepByN(surroundWhitespace(char(",")), 1)(VariableDeclaration.parser),
		possibly(char(";")),
	]).map(([doc, , exported, declared, kind, , list]) => {
		const first = list[0];
		if (first.doc) first.doc.text += doc?.text ?? "";
		else first.doc = doc;
		return new VariableStatement(list, { kind: VariableKindMap[kind], exported, declared });
	});

	toString() {
		let out = "";

		if (this.exported) out += "export ";
		if (this.declared) out += "declare ";
		out += VariableKindReverseMap[this.variableKind] + " ";
		out += this.list.map(decl => decl.toString()).join(", ");
		out += ";";

		return out;
	}
}

export class TypeDeclaration extends ParserBase {
	kind: SyntaxKind.TypeDeclaration = SyntaxKind.TypeDeclaration;

	doc: DocString | null;
	generics: Generic[];

	constructor(
		public name: Identifier,
		public type: Type,
		extra?: {
			doc?: DocString | null;
			generics?: Generic[] | null;
		},
	) {
		super();
		this.doc = extra?.doc ?? null;
		this.generics = extra?.generics ?? [];
	}

	static parser: Parser<TypeDeclaration> = seq([
		possibly(DocString.parser),
		optionalWhitespace,
		str("type"),
		whitespace,
		Identifier.parser,
		optionalWhitespace,
		possibly(GenericList),
		optionalWhitespace,
		str("="),
		optionalWhitespace,
		Type,
		optionalWhitespace,
		char(";"),
	]).map(([doc, , , , id, , generics, , , , type]) => new TypeDeclaration(id, type, { doc, generics: generics }));

	toString() {
		let out = "";

		if (this.doc) out += this.doc + "\n";
		out += "type " + this.name;
		if (this.generics.length) out += "<" + this.generics.join(", ") + ">";
		out += " = " + this.type + ";";

		return out;
	}
}

export class FunctionDeclaration extends ParserBase {
	kind: SyntaxKind.FunctionDeclaration = SyntaxKind.FunctionDeclaration;

	doc: DocString | null;
	exported: boolean;
	declared: boolean;
	generics: Generic[] | null;
	restParameter: RestParameter | null;

	constructor(
		public name: Identifier,
		public args: Parameter[],
		public returnType: Type,
		extra?: {
			doc?: DocString | null;
			exported?: boolean;
			declared?: boolean;
			generics?: Generic[] | null;
			restParameter?: RestParameter | null;
		},
	) {
		super();
		this.doc = extra?.doc ?? null;
		this.exported = extra?.exported ?? false;
		this.declared = extra?.declared ?? false;
		this.generics = extra?.generics ?? null;
		this.restParameter = extra?.restParameter ?? null;
	}

	static parser: Parser<FunctionDeclaration> = seq([
		seq([
			possibly(DocString.parser),
			optionalWhitespace,
			possibly(seq([str("export"), whitespace])).map(x => !!x),
			possibly(seq([str("declare"), whitespace])).map(x => !!x),
			str("function"),
			whitespace,
			Identifier.parser,
		]),
		optionalWhitespace,
		seq([
			possibly(GenericList), //
			optionalWhitespace,
			ParameterList,
			optionalWhitespace,
			str(":"),
			optionalWhitespace,
			Type,
		]),
		optionalWhitespace,
		char(";"),
	]).map(
		([[doc, , exported, declared, , , name], , [generics, , { params, restParameter }, , , , returnType]]) =>
			new FunctionDeclaration(name, params, returnType, { doc, exported, declared, generics, restParameter }),
	);

	toString() {
		let out = "";

		if (this.doc) out += this.doc + "\n";
		if (this.exported) out += "export ";
		if (this.declared) out += "declare ";
		out += "function " + this.name;
		if (this.generics) out += "<" + this.generics.join(", ") + ">";
		out += "(";
		out += this.args.map(arg => arg.toString()).join(", ");
		if (this.restParameter) out += ", " + this.restParameter.toString();
		out += "): " + this.returnType + ";";

		return out;
	}
}

export class ModuleDeclaration extends ParserBase {
	kind: SyntaxKind.ModuleDeclaration = SyntaxKind.ModuleDeclaration;

	doc: DocString | null;
	exported: boolean;
	declared: boolean;

	constructor(
		public readonly name: string,
		public readonly statements: Statement[],
		extra?: {
			doc?: DocString | null;
			exported?: boolean;
			declared?: boolean;
		},
	) {
		super();
		this.doc = extra?.doc ?? null;
		this.exported = extra?.exported ?? false;
		this.declared = extra?.declared ?? false;
	}

	static parser: Parser<ModuleDeclaration> = recursive(() =>
		seq([
			possibly(DocString.parser),
			optionalWhitespace,
			possibly(left(str("export"), whitespace)).map(x => !!x),
			possibly(left(str("declare"), whitespace)).map(x => !!x),
			str("namespace"),
			whitespace,
			Identifier.parser,
			optionalWhitespace,
			str("{"),
			many(choice([ws, Statement])).map(stuff => stuff.filter(nonNull)),
			str("}"),
		]).map(
			([doc, , exported, declared, , , name, , , statements]) =>
				new ModuleDeclaration(name.name, statements, { doc, exported, declared }),
		),
	);

	toString(): string {
		let out = "";
		if (this.doc) out += this.doc + "\n";
		if (this.exported) out += "export ";
		if (this.declared) out += "declare ";
		out += "namespace " + this.name + " {\n";
		for (const statement of this.statements) out += statement.toString().split("\n").join("\n\t") + "\n";
		return out + "}";
	}
}

export type Statement =
	| Directive
	| Pragma
	| Comment
	| InterfaceDeclaration
	| VariableStatement
	| TypeDeclaration
	| ModuleDeclaration
	| FunctionDeclaration;

export const Statement: Parser<Statement> = choice([
	ModuleDeclaration.parser,
	FunctionDeclaration.parser,
	InterfaceDeclaration.parser,
	VariableStatement.parser,
	TypeDeclaration.parser,
	Comment.parser,
]);
