import { Parser, ResultType } from "arcsecond";
import { ends, last } from "./utils.ts";
import { expect } from "bun:test";

const printErrorSrc = (
	direction: "Forwards" | "Inverse",
	source: string,
	result: ResultType<unknown, string, string>,
) => {
	if (!result.isError) return;

	const index = result.index;

	const sourceBits = source
		.slice(0, index + 1) // +1 to include the error character
		.replace(/\t/g, "    ")
		.split("\n") // Split by lines
		.slice(-5); // Take upto the last 5 lines

	const afterError = source.slice(index + 1).split("\n")[0];

	const leading = last(sourceBits).length - 1;
	const errLine = "\n" + " ".repeat(leading) + "^";
	const errorSrc = sourceBits.join("\n") + afterError + errLine;

	console.log("\n");
	console.error(`-- ${direction} -- Parsing source errored here:\n`);
	console.error(errorSrc);
	console.error(result.error);
	console.log("\n");

	throw 1;
};

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
		if (requireFail) return expect(result.isError).toBeTrue();
		else {
			if (result.isError) printErrorSrc("Forwards", source, result);
			else {
				expect(result, "-- Forwards --").toEqual({
					isError: false,
					result: expected,
					index: source.length,
					data: null,
				});
			}
		}
	}

	if (skipInverse) return;
	if (requireFail) return;

	{
		const newSource = String(expected);
		const result2 = ended.run(newSource);

		if (result2.isError) printErrorSrc("Inverse", newSource, result2);
		else
			expect(result2, "-- Inverse --").toEqual({
				isError: false,
				result: expected,
				index: newSource.length,
				data: null,
			});
	}
};

export const assertParserFn = <T>(parserFn: Parser<T>["run"], source: string, expected: T) => {
	const result = parserFn(source);
	expect(result).toEqual({ isError: false, result: expected, index: source.length, data: null });
};
