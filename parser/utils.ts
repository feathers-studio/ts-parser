import {
	between,
	choice,
	endOfInput,
	everyCharUntil,
	optionalWhitespace,
	Parser,
	recursiveParser,
	regex,
	sepBy,
	sequenceOf,
	str,
	takeLeft,
	whitespace,
} from "arcsecond";

export const head = <T>(xs: T[]) => xs[0];
export const tail = <T>(xs: T[]) => xs.slice(1);
export const init = <T>(xs: T[]) => xs.slice(0, xs.length - 1);
export const last = <T>(xs: T[]) => xs[xs.length - 1];

export const seq = sequenceOf;
export const lazy = recursiveParser;

export const ws = whitespace.map(() => null);
export const wss = optionalWhitespace.map(() => null);
export const spaces = regex(/^( |\t|\r)*/).map(() => null);
export const ends = <P extends Parser<T>, T>(parser: P): P => takeLeft(parser)(endOfInput) as P;
export const lit = <T extends string>(value: T) => str(value).map(() => value);

export function nonNull<T>(value: T | null): value is T {
	return value != null;
}

// updateError :: (ParserState e a s, f) -> ParserState f a s
export const updateError = (state: { isError: boolean; error: string }, error: string) =>
	Object.assign(Object.assign({}, state), { isError: true, error });

// sepByN :: (Parser e a s, n) -> Parser e b s -> Parser e [b] s
export const sepByN = (sepParser: Parser<unknown>, n: number) => {
	return function sepByN$valParser<V>(valueParser: Parser<V>): Parser<V[]> {
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
