import { choice, many } from "npm:arcsecond";
import { Reference } from "./reference.ts";
import { Comment } from "./comment.ts";
import { ends, nonNull, seq, ws } from "./utils.ts";
import { InterfaceDeclaration } from "./interface.ts";
import { ParserBase } from "./base.ts";

const FileHeader = many(choice([Reference.parse, ws, Comment.parse])) //
	.map(defs => defs.filter(nonNull));

export type Statement = Reference | Comment | InterfaceDeclaration;

export class DeclarationFile extends ParserBase {
	private constructor(public readonly statements: Statement[]) {
		super();
	}

	static from(statements: Statement[]): DeclarationFile {
		return new DeclarationFile(statements);
	}

	static get parse() {
		return seq([FileHeader, many(choice([ws, Comment.parse, InterfaceDeclaration.parse]))]) //
			.map(stuff => stuff.flat().filter(nonNull))
			.map(stuff => new DeclarationFile(stuff));
	}

	toString(): string {
		let out = "";

		for (const statement of this.statements)
			if (statement.type === "interface") out += "\n" + statement.toString() + "\n";
			else out += statement.toString() + "\n";

		return out;
	}
}

export const parse = (source: string) => ends(DeclarationFile.parse).run(source);

/* missing:

Interface type params

[ ] methods
[ ] declare var
[ ] declare function
[ ] type

*/
