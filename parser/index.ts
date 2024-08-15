import { choice, many, Parser } from "./deps/arcsecond.ts";
import { Comment, Directive, Pragma } from "./comment.ts";
import { ends, nonNull, ws } from "./utils.ts";
import { InterfaceDeclaration, VariableStatement } from "./interface.ts";
import { ParserBase, SyntaxKind } from "./base.ts";

export type Statement =
	| Directive //
	| Pragma
	| Comment
	| InterfaceDeclaration
	| VariableStatement;

export const Statement: Parser<Statement> = choice([
	InterfaceDeclaration.parser,
	VariableStatement.parser,
	Comment.parser,
]);

export class DeclarationFile extends ParserBase {
	kind: SyntaxKind.DeclarationFile = SyntaxKind.DeclarationFile;

	constructor(public readonly statements: Statement[]) {
		super();
	}

	static parser: Parser<DeclarationFile> = many(choice([ws, Statement]))
		.map(stuff => stuff.flat().filter(nonNull))
		.map(stuff => new DeclarationFile(stuff));

	toString(): string {
		let out = "";

		for (const statement of this.statements)
			if (statement.kind === SyntaxKind.InterfaceDeclaration) out += "\n" + statement.toString() + "\n";
			else out += statement.toString() + "\n";

		return out;
	}
}

export const parse = (source: string) => ends(DeclarationFile.parser).run(source);

/* TODO:

[ ] Interface type params
[ ] declare var
[ ] declare function
[ ] type

*/
