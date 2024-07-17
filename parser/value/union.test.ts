import { assertParser } from "../utils.ts";
import { unionValue } from "./union.ts";

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
