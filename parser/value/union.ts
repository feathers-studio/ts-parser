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

Deno.test("unionValue: 1", () => {
	assertParser(unionValue, "string | number", {
		type: "union",
		options: [
			{ primitive: true, type: "string", value: null },
			{ primitive: true, type: "number", value: null },
		],
	});
});

Deno.test("unionValue: 2", () => {
	assertParser(unionValue, "string | Number", {
		type: "union",
		options: [
			{ primitive: true, type: "string", value: null },
			{ type: "identifier", value: "Number" },
		],
	});
});
