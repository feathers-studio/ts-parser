import { assertParser } from "../utils.ts";
import { interfaceExtends } from "./extends.ts";

Deno.test("interfaceExtends", () => {
	assertParser(interfaceExtends, "extends  B", { type: "identifier", value: "B" });
});
