import { choice, many1, Parser, sequenceOf } from "npm:arcsecond";
import { wss, maybeBracketed, wsed, bracketed } from "../utils.ts";
import { unionValue, UnionValue } from "./union.ts";
import { tupleValue, TupleValue } from "./tuple.ts";
import { PrimitiveOrId, primitiveOrId } from "./base.ts";

export interface ArrayValue {
	type: "array";
	value: ArrayValue | UnionValue | TupleValue | PrimitiveOrId;
}

export const arrayValue: Parser<ArrayValue> = sequenceOf([
	wsed(maybeBracketed(wsed(choice([unionValue, tupleValue, primitiveOrId])), "(")),
	many1(wsed(bracketed(wss, "["))),
]) //
	.map(([value, brackets]) => {
		let result: ArrayValue | UnionValue | TupleValue | PrimitiveOrId = value;
		for (const _ of brackets) result = { type: "array", value: result };
		return result as ArrayValue;
	});
