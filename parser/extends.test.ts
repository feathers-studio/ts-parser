import { assertParser } from "./utils.ts";
import { Extends, MaybeExtends } from "./extends.ts";
import { Identifier } from "./identifier.ts";
import { TypeReference } from "./type.ts";

Deno.test("Extends", () => {
	assertParser(Extends, " extends  B", {
		extends: [new TypeReference(new Identifier("B"))],
	});
});

type Extends = Identifier & { extends: TypeReference[] | null };

Deno.test("MaybeExtends: 1", () => {
	assertParser(MaybeExtends(Identifier.parser), "A", {
		type: "identifier",
		name: "A",
		extends: null,
	});
});

Deno.test("MaybeExtends: 2", () => {
	assertParser(MaybeExtends(Identifier.parser), "A extends B", {
		type: "identifier",
		name: "A",
		extends: [new TypeReference(new Identifier("B"))],
	});
});

Deno.test("MaybeExtends: 3", () => {
	assertParser(MaybeExtends(Identifier.parser), "A extends B<C>", {
		type: "identifier",
		name: "A",
		extends: [new TypeReference(new Identifier("B"), [new TypeReference(new Identifier("C"))])],
	});
});
