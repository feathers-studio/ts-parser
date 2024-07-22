import { Reference } from "./reference.ts";
import { assertParser } from "./utils.ts";

Deno.test("reference", () => {
	assertParser(Reference.parse, '/// <reference path="./iterable.d.ts" />', Reference.from("./iterable.d.ts"));
});
