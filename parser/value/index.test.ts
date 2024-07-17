import { assertParser, assertParserFails } from "../utils.ts";
import { value } from "./index.ts";

Deno.test("value: 1", () => {
	assertParser(value, "string", { primitive: true, type: "string", value: null });
});

Deno.test("value: 2", () => {
	assertParser(value, "string | number", {
		type: "union",
		options: [
			{ primitive: true, type: "string", value: null },
			{ primitive: true, type: "number", value: null },
		],
	});
});

Deno.test("value: 3", () => {
	assertParser(value, "[string, number]", {
		type: "tuple",
		values: [
			{ primitive: true, type: "string", value: null },
			{ primitive: true, type: "number", value: null },
		],
	});
});

Deno.test("value: 4", () => {
	assertParser(value, "string[]", {
		type: "array",
		value: { primitive: true, type: "string", value: null },
	});
});

Deno.test("value: 5", () => {
	assertParser(value, "(string | number)[]", {
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

Deno.test("value: 6", () => {
	assertParser(value, "(string | number)[][]", {
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

Deno.test("value: 7", () => {
	assertParser(value, "string[][]", {
		type: "array",
		value: {
			type: "array",
			value: { primitive: true, type: "string", value: null },
		},
	});
});

Deno.test("value: 8", () => {
	assertParser(value, "string | number | null", {
		type: "union",
		options: [
			{ primitive: true, type: "string", value: null },
			{ primitive: true, type: "number", value: null },
			{ primitive: true, type: "null" },
		],
	});
});

Deno.test("value: 9", () => {
	assertParserFails(value, "string | number x[][]");
});

Deno.test("value: 10", () => {
	assertParserFails(value, "string | number[] x");
});
