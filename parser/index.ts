import { choice, many, Parser, sequenceOf } from "npm:arcsecond";
import { Reference } from "./reference.ts";
import { Comment } from "./comment.ts";
import { ends, nonNull, ws } from "./utils.ts";
import { InterfaceDeclaration } from "./interface.ts";
import { ParserBase } from "./base.ts";

const FileHeader = many(choice([Reference.parse, ws, Comment.parse])) //
	.map(defs => defs.filter(nonNull));

export type Statement = Reference | Comment | InterfaceDeclaration;

export class DeclarationFile extends ParserBase {
	constructor(public readonly statements: Statement[]) {
		super();
	}

	static get parse(): Parser<any, string, any> {
		return sequenceOf([FileHeader, many(choice([ws, Comment.parse, InterfaceDeclaration.parse]))]) //
			.map(stuff => stuff.flat().filter(nonNull));
	}

	toString(): string {
		return this.statements.map(v => v.toString()).join("\n");
	}
}

export const parse = ends(DeclarationFile.parse);

/* missing:

Interface type params

[ ] methods
[ ] declare var
[ ] declare function
[ ] type

*/
