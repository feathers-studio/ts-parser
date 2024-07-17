import { char, choice, Parser, sepBy } from "npm:arcsecond";
import { assertParser, bracketed, wsed } from "../utils.ts";

import { MaybeUnionPrimitiveOrId, unionValue } from "./union.ts";
import { primitiveOrId } from "./base.ts";

export interface TupleValue {
	type: "tuple";
	values: MaybeUnionPrimitiveOrId[];
}

export const tupleValue: Parser<TupleValue> = bracketed(
	sepBy<string, MaybeUnionPrimitiveOrId, string, unknown>(char(","))(wsed(choice([unionValue, primitiveOrId]))),
	"[",
).map(values => ({ type: "tuple", values }));
