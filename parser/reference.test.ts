import { Reference } from "./reference.ts";
import { assertParser } from "./utils.ts";

Deno.test("reference", () => {
	assertParser(Reference.parser, '/// <reference path="./iterable.d.ts" />', new Reference("./iterable.d.ts"));
});
