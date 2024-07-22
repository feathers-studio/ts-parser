import { choice, many, sequenceOf } from "npm:arcsecond";
import { reference } from "./reference.ts";
import { anyComment } from "./comment.ts";
import { ends, nonNull, ws } from "./utils.ts";
import { InterfaceDeclaration } from "./interface.ts";

const fileHeader = many(choice([reference, ws, anyComment])) //
	.map(defs => defs.filter(nonNull));

export const parser = ends(
	sequenceOf([fileHeader, many(choice([ws, anyComment, InterfaceDeclaration]))]) //
		.map(stuff => stuff.flat().filter(nonNull)),
);

/* missing:

Interface type params

[ ] methods
[ ] declare var
[ ] declare function
[ ] type

*/
