import { assertParser } from "../utils.ts";
import { interfaceHeader } from "./header.ts";

Deno.test("interfaceHeader: 1", () => {
	assertParser(interfaceHeader, "interface A", { type: "interface-header", name: "A", extends: null });
});

Deno.test("interfaceHeader: 2", () => {
	assertParser(interfaceHeader, "interface A extends  B", { type: "interface-header", name: "A", extends: "B" });
});
