import { assertParser } from "../utils.ts";
import { iface } from "./index.ts";

Deno.test("iface: 1", () => {
	assertParser(
		iface,
		`interface Hello extends World {
		readonly hello ? : World;
		readonly hello : "World";
	}`,
		{
			type: "interface",
			doc: null,
			name: "Hello",
			extends: "World",
			members: [
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					name: { type: "identifier", value: "hello" },
					optional: true,
					defn: { type: "identifier", value: "World" },
				},
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					name: { type: "identifier", value: "hello" },
					optional: false,
					defn: { primitive: true, type: "string", value: "World" },
				},
			],
		},
	);
});

Deno.test("iface: 2", () => {
	assertParser(
		iface,
		`interface Hello {
		readonly hello ? : World;
		readonly hello : "World";
	}`,
		{
			type: "interface",
			doc: null,
			name: "Hello",
			extends: null,
			members: [
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					name: { type: "identifier", value: "hello" },
					optional: true,
					defn: { type: "identifier", value: "World" },
				},
				{
					type: "member",
					doc: null,
					modifier: ["readonly"],
					name: { type: "identifier", value: "hello" },
					optional: false,
					defn: { primitive: true, type: "string", value: "World" },
				},
			],
		},
	);
});
