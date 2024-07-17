import { choice, many, sequenceOf } from "npm:arcsecond";
import { reference } from "./reference.ts";
import { anyComment } from "./comment.ts";
import { ends, nonNull, ws } from "./utils.ts";
import { iface } from "./interface/index.ts";

const FileHeader = many(choice([reference, ws, anyComment])) //
	.map(defs => defs.filter(nonNull));

export const parser = ends(
	sequenceOf([FileHeader, many(choice([ws, anyComment, iface]))]) //
		.map(stuff => stuff.flat().filter(nonNull)),
);

/* missing:

Interface type params

[ ] declare var
[ ] declare function
[ ] type

*/
