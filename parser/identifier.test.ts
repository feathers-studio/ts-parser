import { Identifier } from "./identifier.ts";
import { assertParser, assertParserFails, testParser } from "./utils.ts";

testParser("identifier: 1", Identifier.parser, "helloWorld", new Identifier("helloWorld"));

testParser("identifier: 2", Identifier.parser, "_helloWorld", new Identifier("_helloWorld"));

testParser("identifier: 3", Identifier.parser, "$helloWorld", new Identifier("$helloWorld"));

testParser("identifier: 4", Identifier.parser, "_$helloWorld", new Identifier("_$helloWorld"));

testParser("identifier: 5", Identifier.parser, "helloWorld_", new Identifier("helloWorld_"));

testParser("identifier: 6", Identifier.parser, "helloWorld$", new Identifier("helloWorld$"));

testParser("identifier: 7", Identifier.parser, "helloWorld0", new Identifier("helloWorld0"));

testParser("identifier: 8", Identifier.parser, "helloWorld_0", new Identifier("helloWorld_0"));

testParser("identifier: 9", Identifier.parser, "helloWorld$0", new Identifier("helloWorld$0"));

testParser("identifier: 10", Identifier.parser, "helloWorld_0$", new Identifier("helloWorld_0$"));

testParser("identifier: 11", Identifier.parser, "helloWorld$0_", new Identifier("helloWorld$0_"));

testParser("identifier: 12", Identifier.parser, "helloWorld0_", new Identifier("helloWorld0_"));

testParser("identifier: 13", Identifier.parser, "helloWorld0$", new Identifier("helloWorld0$"));

testParser("identifier: 14", Identifier.parser, "0helloWorld", new Identifier("0helloWorld"), { requireFail: true });

testParser("identifier: 15", Identifier.parser, "0_helloWorld", new Identifier("0_helloWorld"), { requireFail: true });
