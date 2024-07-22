import { choice, many, sequenceOf } from "npm:arcsecond";
import { Reference } from "./reference.ts";
import { Comment } from "./comment.ts";
import { ends, nonNull, ws } from "./utils.ts";
import { InterfaceDeclaration } from "./interface.ts";

const fileHeader = many(choice([Reference.parse, ws, Comment.parse])) //
	.map(defs => defs.filter(nonNull));

export const parser = ends(
	sequenceOf([fileHeader, many(choice([ws, Comment.parse, InterfaceDeclaration.parse]))]) //
		.map(stuff => stuff.flat().filter(nonNull)),
);

/* missing:

Interface type params

[ ] methods
[ ] declare var
[ ] declare function
[ ] type

*/
