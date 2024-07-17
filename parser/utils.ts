import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import {
	between,
	choice,
	endOfInput,
	everyCharUntil,
	many,
	optionalWhitespace,
	Parser,
	sepBy,
	sequenceOf,
	str,
	whitespace,
} from "npm:arcsecond";

export const ws = whitespace.map(() => null);
export const wss = optionalWhitespace.map(() => null);
export const ends = <P extends Parser<unknown>>(parser: P): P =>
	sequenceOf([parser, endOfInput]).map(([value]) => value) as P;

export function nonNull<T>(value: T | null): value is T {
	return value != null;
}

// updateError :: (ParserState e a s, f) -> ParserState f a s
export const updateError = (state: { isError: boolean; error: string }, error: string) =>
	Object.assign(Object.assign({}, state), { isError: true, error });

// sepByN :: (Parser e a s, n) -> Parser e b s -> Parser e [b] s
export const sepByN = <Sep, V>(sepParser: Parser<Sep>, n: number) => {
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

export const wsed = <T>(parser: Parser<T>) => bw(wss, wss)(parser);

const Brackets = {
	"(": ")",
	"{": "}",
	"[": "]",
} as const;

type Brackets = keyof typeof Brackets;

export const bracketed = <T>(parser: Parser<T>, type: Brackets = "(") =>
	bw(str(type), str(Brackets[type]))(wsed(parser));

export const maybeBracketed = <T>(parser: Parser<T>, type: Brackets = "(") => choice([bracketed(parser, type), parser]);

Deno.test("maybeBracketed", () => {
	{
		const result = maybeBracketed(str("Hello, World!")).run("Hello, World!");
		assert(!result.isError);
		assertEquals(result.result, "Hello, World!");
	}

	{
		const result = maybeBracketed(str("Hello, World!")).run("(Hello, World!)");
		assert(!result.isError);
		assertEquals(result.result, "Hello, World!");
	}

	{
		const result = maybeBracketed(str("Hello, World!")).run("( Hello, World!   )");
		assert(!result.isError);
		assertEquals(result.result, "Hello, World!");
	}

	{
		const result = maybeBracketed(str("Hello, World!"), "[").run("[ Hello, World! ]");
		assert(!result.isError);
		assertEquals(result.result, "Hello, World!");
	}

	{
		const result = maybeBracketed(str("Hello, World!"), "{").run("{ Hello, World! }");
		assert(!result.isError);
		assertEquals(result.result, "Hello, World!");
	}
});

export const quoted: Parser<string> = choice([bw(str('"'))(), bw(str("'"))()]);

Deno.test("quoted", () => {
	{
		const result = quoted.run('"Hello, World!"');
		assert(!result.isError);
		assertEquals(result.result, "Hello, World!");
	}

	{
		const result = quoted.run("'Hello, World!'");
		assert(!result.isError);
		assertEquals(result.result, "Hello, World!");
	}
});
