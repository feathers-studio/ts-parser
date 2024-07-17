import { assertParser } from "../utils.ts";
import { primitiveOrId } from "./base.ts";

Deno.test("primitiveOrId: 1", () => {
	assertParser(primitiveOrId, "string", { primitive: true, type: "string", value: null });
});

Deno.test("primitiveOrId: 2", () => {
	assertParser(primitiveOrId, "String", { type: "identifier", value: "String" });
});
