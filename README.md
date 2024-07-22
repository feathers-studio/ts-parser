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
