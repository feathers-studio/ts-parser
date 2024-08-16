import { choice, many, Parser } from "./arcthird/index.ts";
import { ends, nonNull, ws } from "./utils.ts";
import { ParserBase, SyntaxKind } from "./base.ts";
import { Statement } from "./statements.ts";

export class SourceFile extends ParserBase {
	kind: SyntaxKind.DeclarationFile = SyntaxKind.DeclarationFile;

	constructor(public readonly statements: Statement[]) {
		super();
	}

	static parser: Parser<SourceFile> = many(choice([ws, Statement]))
		.map(stuff => stuff.flat().filter(nonNull))
		.map(stuff => new SourceFile(stuff));

	toString(): string {
		let out = "";

		for (const statement of this.statements)
			if (statement.kind === SyntaxKind.InterfaceDeclaration) out += "\n" + statement.toString() + "\n";
			else out += statement.toString() + "\n";

		return out;
	}
}

export const parse = (source: string) => ends(SourceFile.parser).run(source);
