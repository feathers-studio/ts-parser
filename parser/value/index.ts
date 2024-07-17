import { type PrimitiveOrId, primitiveOrId } from "./base.ts";
import { TupleValue, tupleValue } from "./tuple.ts";
import { UnionValue, unionValue } from "./union.ts";
import { ArrayValue, arrayValue } from "./array.ts";
import { choice, Parser } from "npm:arcsecond";
import { assertParser, assertParserFails } from "../utils.ts";

export type Value = UnionValue | TupleValue | ArrayValue | PrimitiveOrId;

export const value: Parser<Value> = choice([unionValue, tupleValue, arrayValue, primitiveOrId]);
