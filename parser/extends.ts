import { char, Parser, possibly, sequenceOf, str, whitespace } from "npm:arcsecond";
import { Type } from "./type.ts";
import { Identifier } from "./identifier.ts";
import { sepByN, wsed } from "./utils.ts";

export const Extends = sequenceOf([whitespace, str("extends"), whitespace, sepByN<Type>(wsed(char(",")), 1)(Type)]) //
	.map(([, , , value]) => ({ extends: value }));

export const MaybeExtends = (parser: Parser<Identifier>): Parser<Identifier & { extends: Type[] | null }> =>
	sequenceOf([parser, possibly(Extends)]) //
		.map(([value, exts]) => ({ ...value, extends: exts ? exts.extends : null }));
