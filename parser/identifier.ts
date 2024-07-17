import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { choice, digit, letter, many, Parser, sequenceOf, str } from "npm:arcsecond";

// "(_|$|[a-zA-Z])(_|$|[a-zA-Z0-9])+";

const fstChar = choice([str("_"), str("$"), letter]);

export interface Identifier {
	type: "identifier";
	value: string;
}

export const identifier: Parser<Identifier> = //
	sequenceOf([fstChar, many(choice([fstChar, digit])).map(chars => chars.join(""))])
		.map(([n, d]) => n + d)
		.map(str => ({ type: "identifier", value: str }));

Deno.test("identifier", () => {
	{
		const result = identifier.run("helloWorld");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld" });
	}

	{
		const result = identifier.run("_helloWorld");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "_helloWorld" });
	}

	{
		const result = identifier.run("$helloWorld");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "$helloWorld" });
	}

	{
		const result = identifier.run("_$helloWorld");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "_$helloWorld" });
	}

	{
		const result = identifier.run("helloWorld_");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld_" });
	}

	{
		const result = identifier.run("helloWorld$");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld$" });
	}

	{
		const result = identifier.run("helloWorld0");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld0" });
	}

	{
		const result = identifier.run("helloWorld_0");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld_0" });
	}

	{
		const result = identifier.run("helloWorld$0");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld$0" });
	}

	{
		const result = identifier.run("helloWorld_0$");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld_0$" });
	}

	{
		const result = identifier.run("helloWorld$0_");
		assert(!result.isError);
		assertEquals(result.result, { type: "identifier", value: "helloWorld$0_" });
	}

	{
		const result = identifier.run("0helloWorld");
		assert(result.isError);
	}

	{
		const result = identifier.run("-");
		assert(result.isError);
	}
});
