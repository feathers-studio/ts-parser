import { assertParser } from "../utils.ts";
import { arrayValue } from "./array.ts";

Deno.test("arrayValue: 1", () => {
	assertParser(arrayValue, "string[]", {
		type: "array",
		value: { primitive: true, type: "string", value: null },
	});
});

Deno.test("arrayValue: 2", () => {
	assertParser(arrayValue, "(string | number)[]", {
		type: "array",
		value: {
			type: "union",
			options: [
				{ primitive: true, type: "string", value: null },
				{ primitive: true, type: "number", value: null },
			],
		},
	});
});

Deno.test("arrayValue: 3", () => {
	assertParser(arrayValue, "(string | number)[][]", {
		type: "array",
		value: {
			type: "array",
			value: {
				type: "union",
				options: [
					{ primitive: true, type: "string", value: null },
					{ primitive: true, type: "number", value: null },
				],
			},
		},
	});
});
