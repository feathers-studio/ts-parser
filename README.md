# Ambient TS Parser

This is a very minimal TS Parser that can be used to parse d.ts files and extract the type information from them.

It is not a full-fledged parser and does not support all the features of TypeScript. It is designed to be used by [Ambience](https://github.com/feathers-studio/ambience) to parse lib files.

## Usage

```ts
import { parse } from "ts-parser/parse/index.ts";

const source = `
interface Foo {
	bar: string;
}
`;

const ast = parse(source);
```

> [!NOTE]
> This is not a particularly fast parser, but it is fast enough and structured to be very convenient for [Ambience](https://github.com/feathers-studio/ambience).
>
> Work has been done to make parsing more reasonable by vendoring Arcsecond and optimising it for our usecase (~35x faster parsing with our fork).
>
> Further work will be done in the future.
>
> Benchmark, parsing `lib.dom.d.ts`:
>
> ```
> = Bun  ================
>
>   Time (mean ± σ):     11.850 s ±  0.130 s    [User: 12.432 s, System: 0.543 s]
>   Range (min … max):   11.737 s … 12.177 s    10 runs
>
> = Deno ================
>
>   Time (mean ± σ):      5.258 s ±  0.067 s    [User: 5.814 s, System: 0.257 s]
>   Range (min … max):    5.141 s …  5.351 s    10 runs
>
> = Node ================
>
>   Time (mean ± σ):     12.571 s ±  0.203 s    [User: 13.122 s, System: 0.310 s]
>   Range (min … max):   12.229 s … 12.891 s    10 runs
>
> =======================
>
> Summary
>   'deno run -A test.ts' ran
>     2.25 ± 0.04 times faster than 'bun run test.ts'
>     2.39 ± 0.05 times faster than 'tsx test.ts'
>
> ```
