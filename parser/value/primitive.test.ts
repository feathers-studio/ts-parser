import { assertParser } from "../utils.ts";
import { string, number, boolean, nullValue, undefinedValue, symbol, bigint, primitive } from "./primitive.ts";

Deno.test("primitive:string", () => {
	assertParser(string, '"Hello, World!"', { primitive: true, type: "string", value: "Hello, World!" });
});

Deno.test("primitive:number", () => {
	assertParser(number, "123", { primitive: true, type: "number", value: 123 });
});

Deno.test("primitive:boolean", () => {
	assertParser(boolean, "true", { primitive: true, type: "boolean", value: true });
});

Deno.test("primitive:null", () => {
	assertParser(nullValue, "null", { primitive: true, type: "null" });
});

Deno.test("primitive:undefined", () => {
	assertParser(undefinedValue, "undefined", { primitive: true, type: "undefined" });
});

Deno.test("primitive:symbol", () => {
	assertParser(symbol, "symbol", { primitive: true, type: "symbol" });
});

Deno.test("primitive:bigint", () => {
	assertParser(bigint, "123n", { primitive: true, type: "bigint", value: 123n });
});

Deno.test("any-primitive:string", () => {
	assertParser(primitive, '"Hello, World!"', { primitive: true, type: "string", value: "Hello, World!" });
});

Deno.test("any-primitive:number", () => {
	assertParser(primitive, "123", { primitive: true, type: "number", value: 123 });
});

Deno.test("any-primitive:boolean", () => {
	assertParser(primitive, "true", { primitive: true, type: "boolean", value: true });
});

Deno.test("any-primitive:null", () => {
	assertParser(primitive, "null", { primitive: true, type: "null" });
});

Deno.test("any-primitive:undefined", () => {
	assertParser(primitive, "undefined", { primitive: true, type: "undefined" });
});

Deno.test("any-primitive:symbol", () => {
	assertParser(primitive, "symbol", { primitive: true, type: "symbol" });
});

Deno.test("any-primitive:bigint", () => {
	assertParser(primitive, "123n", { primitive: true, type: "bigint", value: 123n });
});
