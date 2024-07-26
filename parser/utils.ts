import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import {
	between,
	choice,
	endOfInput,
	everyCharUntil,
	optionalWhitespace,
	Parser,
	recursiveParser,
	sepBy,
	sequenceOf,
	str,
	takeLeft,
	whitespace,
} from "npm:arcsecond";
import { ParserBase } from "./base.ts";

export const head = <T>(xs: T[]) => xs[0];
export const tail = <T>(xs: T[]) => xs.slice(1);
export const init = <T>(xs: T[]) => xs.slice(0, xs.length - 1);
export const last = <T>(xs: T[]) => xs[xs.length - 1];

export const testParser = <T extends ParserBase>(
	name: string,
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
	const error = new Error();
	Error.captureStackTrace(error);
	const stack = error.stack;

	const ended = ends(parser);

	Deno.test(name + " (Forwards )", () => {
		const result = ended.run(source);
		if (requireFail) return assert(result.isError, stack);
		else assertEquals(result, { isError: false, result: expected, index: source.length, data: null }, stack);
	});

	if (skipInverse) return;
	if (requireFail) return;

	Deno.test(name + " (Backwards)", () => {
		const newSource = expected.toString();
		const result2 = ended.run(newSource);
		if (result2.isError) console.error(newSource, "\n", result2.error);
		assertEquals(result2, { isError: false, result: expected, index: newSource.length, data: null }, stack);
	});
};

export const assertParserFn = <T>(parserFn: Parser<T>["run"], source: string, expected: T) => {
	const result = parserFn(source);
	assertEquals(result, { isError: false, result: expected, index: source.length, data: null });
};

export const seq = sequenceOf;
export const lazy = recursiveParser;

export const ws = whitespace.map(() => null);
export const wss = optionalWhitespace.map(() => null);
export const ends = <P extends Parser<T>, T>(parser: P): P => takeLeft(parser)(endOfInput) as P;

export function nonNull<T>(value: T | null): value is T {
	return value != null;
}

// updateError :: (ParserState e a s, f) -> ParserState f a s
export const updateError = (state: { isError: boolean; error: string }, error: string) =>
	Object.assign(Object.assign({}, state), { isError: true, error });

// sepByN :: (Parser e a s, n) -> Parser e b s -> Parser e [b] s
export const sepByN = <V, Sep = unknown>(sepParser: Parser<Sep>, n: number) => {
	return function sepByN$valParser(valueParser: Parser<V>): Parser<V[]> {
		return new Parser(function sepByN$valParser$state(state: any) {
			if (state.isError) return state;
			const out = sepBy(sepParser)(valueParser).p(state);
			if (out.isError) return out;
			if (out.result.length < n) {
				return updateError(
					state,
					`ParseError 'sepByN' (position ${state.index}): Expecting to match at least ${n} separated value`,
				);
			}
			return out;
		});
	};
};

export const bw =
	<A extends Parser<unknown>, B extends Parser<unknown>>(a: A, b?: B) =>
	<C extends Parser<unknown> = Parser<string>>(consume?: C) =>
		between(a)(b ?? a)(consume ?? everyCharUntil(b ?? a)) as C;

const q = {
	single: bw(str("'"))(),
	double: bw(str('"'))(),
};

export const quoted = {
	single: q.single,
	double: q.double,
	any: choice([q.single, q.double]),
};

export const surroundWhitespace = <T>(parser: Parser<T>) => bw(wss)(parser);

export const interleaveWhitespace = <Ps extends Parser<unknown>[]>(...parsers: Ps) => {
	return seq(
		parsers.reduce((acc, parser) => {
			if (acc.length === 0) return [parser];
			return [...acc, whitespace, parser];
		}, [] as Parser<unknown>[]),
	).map(result => {
		const out = [];
		for (let i = 0; i < result.length; i += 2) out.push(result[i]);
		return out;
	}) as unknown as Ps;
};

const Brackets = {
	"(": ")",
	"{": "}",
	"[": "]",
	"<": ">",
} as const;

type Brackets = keyof typeof Brackets;

export const bracketed = <T>(parser: Parser<T>, type: Brackets = "(") =>
	bw(str(type), str(Brackets[type]))(surroundWhitespace(parser));

export const maybeBracketed = <T>(parser: Parser<T>, type: Brackets = "(") => choice([bracketed(parser, type), parser]);
