import { Parser } from "arcsecond";
import { assert, assertEquals } from "@std/assert";
import { ends } from "./utils.ts";

export const assertParser = <T>(
	parser: Parser<T>,
	source: string,
	expected: T,
	{
		skipInverse = false,
		requireFail = false,
	}: {
		/** Set to true to disable the inverse (AST -> source) test */
		skipInverse?: boolean;
		/** Set to true to require the parser to fail */
		requireFail?: boolean;
	} = {},
) => {
	const ended = ends(parser);

	{
		const result = ended.run(source);
		if (requireFail) return assert(result.isError, " (Forwards)");
		else
			assertEquals(
				result,
				{ isError: false, result: expected, index: source.length, data: null },
				" *<Forwards>",
			);
	}

	if (skipInverse) return;
	if (requireFail) return;

	{
		const newSource = String(expected);
		const result2 = ended.run(newSource);

		let errorPos = result2.isError
			? "\n" +
			  newSource
					.slice(result2.index - 60, result2.index + 1)
					.split("\n")
					.at(-1)
			: "";

		errorPos += errorPos ? "\n" + " ".repeat(errorPos.length) + "^" : "";

		assertEquals(
			result2,
			{ isError: false, result: expected, index: newSource.length, data: null },
			" *<Backwards>" + errorPos,
		);
	}
};

export const assertParserFn = <T>(parserFn: Parser<T>["run"], source: string, expected: T) => {
	const result = parserFn(source);
	assertEquals(result, { isError: false, result: expected, index: source.length, data: null });
};
