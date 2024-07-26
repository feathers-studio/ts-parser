import { DocString } from "./docString.ts";
import { testParser } from "./utils.ts";

testParser(
	"docString", //
	DocString.parser,
	"/** Hello, World! */",
	new DocString(" Hello, World! "),
);
