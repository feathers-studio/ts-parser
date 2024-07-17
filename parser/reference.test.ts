import { reference } from "./reference.ts";
import { assertParser } from "./utils.ts";

Deno.test("reference", () => {
	assertParser(reference, '/// <reference path="./iterable.d.ts" />', { type: "reference", path: "./iterable.d.ts" });
});
