import { DeclarationFile, parse } from "./index.ts";
import { assertParser } from "./utils.ts";
import { Comment, Directive } from "./comment.ts";
import { InterfaceDeclaration } from "./interface.ts";
import { ArrayType, IndexKey, Member, TypeReference, UnionType } from "./type.ts";
import { DocString } from "./docString.ts";
import { Predefined } from "./predefined.ts";
import { Literal } from "./literal.ts";
import { Identifier } from "./identifier.ts";
import { ParserBase } from "./base.ts";
import { assertThrows } from "jsr:@std/assert@1.0.0/throws";
import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { assertParserFn } from "./utils.ts";

// For test coverage 🙄
Deno.test("ParserBase", () => {
	assertThrows(() => ParserBase.parser.run("test"));
});

const testSource = `
/// Extract from lib.dom.d.ts
/// <reference path="./iterable.d.ts" />

/* Source is from @types/web */

/////////////////////////////
/// Window APIs
/////////////////////////////

/** This should be parsed as doc, not comment! */
interface A extends B, C, D {
	foo?: Bar;
	baz: string | number;
}

interface AddEventListenerOptions extends EventListenerOptions {
	once?: boolean;
	passive?: boolean;
	signal?: AbortSignal;
	init?: string[][];
}

interface ComputedKeyframe {
	composite: CompositeOperationOrAuto;
	computedOffset: number;
	easing: string;
	offset: number | null;
	[property: string]: string | number | null | undefined;
}

interface ConstrainDOMStringParameters {
    exact?: string | string[];
    ideal?: string | string[];
}
	
interface KeyboardEventInit extends EventModifierInit {
	/** @deprecated */
	charCode?: number;
	code?: string;
	isComposing?: boolean;
	key?: string;
	/** @deprecated */
	keyCode?: number;
	location?: number;
	repeat?: boolean;
}
	
/**
 * This Streams API interface provides a built-in byte length queuing strategy that can be used when constructing streams.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy)
 */
interface ByteLengthQueuingStrategy extends QueuingStrategy<ArrayBufferView> {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy/highWaterMark) */
    readonly highWaterMark: number;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy/size) */
    readonly size: QueuingStrategySize<ArrayBufferView>;
}`;

const expectFixture = [
	new Comment("/ Extract from lib.dom.d.ts", false),
	new Directive("reference", { path: "./iterable.d.ts" }),
	new Comment(" Source is from @types/web ", true),
	new Comment("///////////////////////////", false),
	new Comment("/ Window APIs", false),
	new Comment("///////////////////////////", false),

	new InterfaceDeclaration(
		"A",
		[
			new Member(new Identifier("foo"), new TypeReference(new Identifier("Bar")), { optional: true }),
			new Member(
				new Identifier("baz"), //
				new UnionType([new Predefined.StringType(), new Predefined.NumberType()]),
			),
		],
		{
			extends: [
				new TypeReference(new Identifier("B")),
				new TypeReference(new Identifier("C")),
				new TypeReference(new Identifier("D")),
			],
			doc: new DocString(" This should be parsed as doc, not comment! "),
		},
	),

	new InterfaceDeclaration(
		"AddEventListenerOptions",
		[
			new Member(new Identifier("once"), new Predefined.BooleanType(), { optional: true }),
			new Member(new Identifier("passive"), new Predefined.BooleanType(), { optional: true }),
			new Member(new Identifier("signal"), new TypeReference(new Identifier("AbortSignal")), {
				optional: true,
			}),
			new Member(
				new Identifier("init"), //
				new ArrayType(new ArrayType(new Predefined.StringType())),
				{ optional: true },
			),
		],
		{
			extends: [new TypeReference(new Identifier("EventListenerOptions"))],
		},
	),

	new InterfaceDeclaration("ComputedKeyframe", [
		new Member(new Identifier("composite"), new TypeReference(new Identifier("CompositeOperationOrAuto"), null)),
		new Member(
			new Identifier("computedOffset"), //
			new Predefined.NumberType(),
		),
		new Member(
			new Identifier("easing"), //
			new Predefined.StringType(),
		),
		new Member(
			new Identifier("offset"), //
			new UnionType([new Predefined.NumberType(), new Literal.NullType()]),
		),
		new Member(
			new IndexKey("property", new Predefined.StringType()),
			new UnionType([
				new Predefined.StringType(),
				new UnionType([
					new Predefined.NumberType(),
					new UnionType([new Literal.NullType(), new Literal.UndefinedType()]),
				]),
			]),
		),
	]),

	new InterfaceDeclaration("ConstrainDOMStringParameters", [
		new Member(
			new Identifier("exact"), //
			new UnionType([new Predefined.StringType(), new ArrayType(new Predefined.StringType())]),
			{ optional: true },
		),
		new Member(
			new Identifier("ideal"), //
			new UnionType([new Predefined.StringType(), new ArrayType(new Predefined.StringType())]),
			{ optional: true },
		),
	]),

	new InterfaceDeclaration(
		"KeyboardEventInit",
		[
			new Member(
				new Identifier("charCode"), //
				new Predefined.NumberType(),
				{ optional: true, doc: new DocString(" @deprecated ") },
			),
			new Member(
				new Identifier("code"), //
				new Predefined.StringType(),
				{ optional: true },
			),
			new Member(
				new Identifier("isComposing"), //
				new Predefined.BooleanType(),
				{ optional: true },
			),
			new Member(
				new Identifier("key"), //
				new Predefined.StringType(),
				{ optional: true },
			),
			new Member(
				new Identifier("keyCode"), //
				new Predefined.NumberType(),
				{ optional: true, doc: new DocString(" @deprecated ") },
			),
			new Member(
				new Identifier("location"), //
				new Predefined.NumberType(),
				{ optional: true },
			),
			new Member(
				new Identifier("repeat"), //
				new Predefined.BooleanType(),
				{ optional: true },
			),
		],
		{
			extends: [new TypeReference(new Identifier("EventModifierInit"))],
		},
	),

	new InterfaceDeclaration(
		"ByteLengthQueuingStrategy",
		[
			new Member(
				new Identifier("highWaterMark"), //
				new Predefined.NumberType(),
				{
					modifiers: ["readonly"],
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy/highWaterMark) ",
					),
				},
			),
			new Member(
				new Identifier("size"), //
				new TypeReference(new Identifier("QueuingStrategySize"), [
					new TypeReference(new Identifier("ArrayBufferView")),
				]),
				{
					modifiers: ["readonly"],
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy/size) ",
					),
				},
			),
		],
		{
			extends: [
				new TypeReference(new Identifier("QueuingStrategy"), [
					new TypeReference(new Identifier("ArrayBufferView")),
				]),
			],
			doc: new DocString(
				"\n" +
					" * This Streams API interface provides a built-in byte length queuing strategy that can be used when constructing streams.\n" +
					" *\n" +
					" * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy)\n" +
					" ",
			),
		},
	),
];

Deno.test("DeclarationFile", () => {
	assertParser(DeclarationFile.parser, testSource, new DeclarationFile(expectFixture));
});

Deno.test("parse", () => {
	assertParserFn(parse, testSource, new DeclarationFile(expectFixture));
});

Deno.test("roundtrip", () => {
	const parsed = parse(testSource);
	assert(!parsed.isError);
	const printed = parsed.result.toString();
	const reparsed = parse(printed);
	assert(!reparsed.isError);

	assertEquals(reparsed.result, parsed.result);
	assertEquals(reparsed.result, new DeclarationFile(expectFixture));
	assertEquals(reparsed.result.toString(), parsed.result.toString());
});
