import { assertParser } from "../utils.ts";
import { indexKey } from "./index-key.ts";

Deno.test("indexSignature", () => {
	assertParser(indexKey, "[key: string]", {
		type: "index-key",
		name: "key",
		indexType: { primitive: true, type: "string", value: null },
	});
});
