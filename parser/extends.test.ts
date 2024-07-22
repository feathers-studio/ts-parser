import { assertParser } from "./utils.ts";
import { Extends, MaybeExtends } from "./extends.ts";
import { Identifier } from "./identifier.ts";

Deno.test("Extends", () => {
	assertParser(Extends, " extends  B", {
		extends: [
			{
				type: "type-reference",
				name: {
					type: "identifier",
					name: "B",
				},
				typeArguments: null,
			},
		],
	});
});

Deno.test("MaybeExtends: 1", () => {
	assertParser(MaybeExtends(Identifier), "A", { type: "identifier", name: "A", extends: null });
});

Deno.test("MaybeExtends: 2", () => {
	assertParser(MaybeExtends(Identifier), "A extends B", {
		type: "identifier",
		name: "A",
		extends: [
			{
				type: "type-reference",
				name: {
					type: "identifier",
					name: "B",
				},
				typeArguments: null,
			},
		],
	});
});

Deno.test("MaybeExtends: 3", () => {
	assertParser(MaybeExtends(Identifier), "A extends B<C>", {
		type: "identifier",
		name: "A",
		extends: [
			{
				type: "type-reference",
				name: {
					type: "identifier",
					name: "B",
				},
				typeArguments: [
					{
						type: "type-reference",
						name: {
							type: "identifier",
							name: "C",
						},
						typeArguments: null,
					},
				],
			},
		],
	});
});
