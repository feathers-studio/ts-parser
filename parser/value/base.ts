import { choice, Parser } from "npm:arcsecond";
import { identifier, Identifier } from "../identifier.ts";
import { primitive, Primitive } from "./primitive.ts";
import { maybeBracketed } from "../utils.ts";

export type PrimitiveOrId = Primitive | Identifier;

export const primitiveOrId: Parser<PrimitiveOrId> = //
	maybeBracketed(choice([primitive, identifier]));
