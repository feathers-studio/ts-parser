import { assertParser } from "../utils.ts";
import { tupleValue } from "./tuple.ts";

Deno.test("tupleValue: 1", () => {
	assertParser(tupleValue, "[string]", {
		type: "tuple",
		values: [{ primitive: true, type: "string", value: null }],
	});
});

Deno.test("tupleValue: 2", () => {
	assertParser(tupleValue, "[string, number]", {
		type: "tuple",
		values: [
			{ primitive: true, type: "string", value: null },
			{ primitive: true, type: "number", value: null },
		],
	});
});
