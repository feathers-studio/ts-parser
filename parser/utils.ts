import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import {
	between,
	choice,
	endOfInput,
	everyCharUntil,
	optionalWhitespace,
	Parser,
	sepBy,
	sequenceOf,
	str,
	whitespace,
} from "npm:arcsecond";

export const assertParser = (parser: Parser<unknown>, source: string, expected: unknown) => {
	const result = ends(parser).run(source);
	assertEquals(result, { isError: false, result: expected, index: source.length, data: null });
};

export const assertParserFails = (parser: Parser<unknown>, source: string) => {
	const result = ends(parser).run(source);
	assert(result.isError);
};

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

Deno.test("maybeBracketed: 1", () => {
	assertParser(maybeBracketed(str("Hello, World!")), "Hello, World!", "Hello, World!");
});

Deno.test("maybeBracketed: 2", () => {
	assertParser(maybeBracketed(str("Hello, World!")), "(Hello, World!)", "Hello, World!");
});

Deno.test("maybeBracketed: 3", () => {
	assertParser(maybeBracketed(str("Hello, World!")), "( Hello, World!   )", "Hello, World!");
});

Deno.test("maybeBracketed: 4", () => {
	assertParser(maybeBracketed(str("Hello, World!"), "["), "[ Hello, World! ]", "Hello, World!");
});

Deno.test("maybeBracketed: 5", () => {
	assertParser(maybeBracketed(str("Hello, World!"), "{"), "{ Hello, World! }", "Hello, World!");
});

export const quoted: Parser<string> = choice([bw(str('"'))(), bw(str("'"))()]);

Deno.test("quoted: 1", () => {
	assertParser(quoted, '"Hello, World!"', "Hello, World!");
});

Deno.test("quoted: 2", () => {
	assertParser(quoted, "'Hello, World!'", "Hello, World!");
});
