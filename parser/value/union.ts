import { Parser, str } from "npm:arcsecond";
import { assertParser, sepByN, wsed } from "../utils.ts";
import { PrimitiveOrId, primitiveOrId } from "./base.ts";

const unionSep: Parser<null> = wsed(str("|")).map(() => null);

export interface UnionValue {
	type: "union";
	options: PrimitiveOrId[];
}

export const unionValue: Parser<UnionValue> = //
	sepByN<null, PrimitiveOrId>(
		unionSep,
		2,
	)(primitiveOrId) //
		.map(options => ({ type: "union", options }));

export type MaybeUnionPrimitiveOrId = PrimitiveOrId | UnionValue;
