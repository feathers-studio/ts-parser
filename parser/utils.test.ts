import { str } from "npm:arcsecond";
import { assertParser, maybeBracketed, quoted, testParser } from "./utils.ts";

testParser("maybeBracketed: 1", maybeBracketed(str("Hello, World!")), "Hello, World!", "Hello, World!");

testParser("maybeBracketed: 2", maybeBracketed(str("Hello, World!")), "(Hello, World!)", "Hello, World!");

testParser("maybeBracketed: 3", maybeBracketed(str("Hello, World!")), "( Hello, World!   )", "Hello, World!");

testParser("maybeBracketed: 4", maybeBracketed(str("Hello, World!"), "["), "[ Hello, World! ]", "Hello, World!");

testParser("maybeBracketed: 5", maybeBracketed(str("Hello, World!"), "{"), "{ Hello, World! }", "Hello, World!");

testParser("quoted: 1", quoted.any, '"Hello, World!"', "Hello, World!", { skipReturn: true });

testParser("quoted: 2", quoted.any, "'Hello, World!'", "Hello, World!", { skipReturn: true });
