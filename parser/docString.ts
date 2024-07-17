import { Parser, str } from "npm:arcsecond";
import { bw } from "./utils.ts";

export interface DocString {
	type: "docString";
	doc: string;
}

export const docString: Parser<DocString> = bw(str("/**"), str("*/"))().map(doc => ({ type: "docString", doc }));
