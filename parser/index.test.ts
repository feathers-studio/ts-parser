import { test, expect } from "bun:test";
import { DeclarationFile, parse, Statement } from "./index.ts";
import { assertParser, assertParserFn } from "./test-util.ts";
import { Comment, Directive, Pragma } from "./comment.ts";
import { InterfaceDeclaration, VariableDeclaration, VariableKind, VariableStatement } from "./interface.ts";
import {
	ArrayType,
	ConstructSignature,
	FunctionType,
	Generic,
	IndexedAccessType,
	IndexSignature,
	KeyOfOperator,
	MethodSignature,
	ObjectType,
	Parameter,
	PropertySignature,
	TypeReference,
	UnionType,
} from "./type.ts";
import { DocString } from "./docString.ts";
import { Predefined } from "./predefined.ts";
import { Literal } from "./literal.ts";
import { Identifier } from "./identifier.ts";
import { ParserBase } from "./base.ts";

// For test coverage 🙄
test("ParserBase", () => {
	expect(ParserBase.parser.run("test").isError).toBe(true);
});

const testSource = `
/// Extract from lib.dom.d.ts
/// <reference path="./iterable.d.ts" />

// @ts-check

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
}
	


declare var BroadcastChannel: {
    // new(name: string): BroadcastChannel;
    prototype: BroadcastChannel;
    new(name: string): BroadcastChannel;
};

declare var ByteLengthQueuingStrategy: {
    prototype: ByteLengthQueuingStrategy;
    new(init: QueuingStrategyInit): ByteLengthQueuingStrategy;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation) */
interface CSSAnimation extends Animation {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation/animationName) */
    readonly animationName: string;
    addEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

	
interface CSSGroupingRule extends CSSRule {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule/cssRules) */
    readonly cssRules: CSSRuleList;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule/deleteRule) */
    deleteRule(index: number): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule/insertRule) */
    insertRule(rule: string, index?: number): number;
}
	
interface AbstractWorker {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorker/error_event) */
    onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null;
}

interface AbortSignalEventMap {
    "abort": Event;
}`;

const expectFixture: Statement[] = [
	new Comment("/ Extract from lib.dom.d.ts", false),
	new Directive("reference", { path: "./iterable.d.ts" }),
	new Pragma("@ts-check"),
	new Comment(" Source is from @types/web ", true),
	new Comment("///////////////////////////", false),
	new Comment("/ Window APIs", false),
	new Comment("///////////////////////////", false),

	new InterfaceDeclaration(
		"A",
		[
			new PropertySignature(new Identifier("foo"), new TypeReference(new Identifier("Bar")), { optional: true }),
			new PropertySignature(
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
			new PropertySignature(new Identifier("once"), new Predefined.BooleanType(), { optional: true }),
			new PropertySignature(new Identifier("passive"), new Predefined.BooleanType(), { optional: true }),
			new PropertySignature(new Identifier("signal"), new TypeReference(new Identifier("AbortSignal")), {
				optional: true,
			}),
			new PropertySignature(
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
		new PropertySignature(
			new Identifier("composite"),
			new TypeReference(new Identifier("CompositeOperationOrAuto"), null),
		),
		new PropertySignature(
			new Identifier("computedOffset"), //
			new Predefined.NumberType(),
		),
		new PropertySignature(
			new Identifier("easing"), //
			new Predefined.StringType(),
		),
		new PropertySignature(
			new Identifier("offset"), //
			new UnionType([new Predefined.NumberType(), new Literal.NullType()]),
		),
		new PropertySignature(
			new IndexSignature("property", new Predefined.StringType()),
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
		new PropertySignature(
			new Identifier("exact"), //
			new UnionType([new Predefined.StringType(), new ArrayType(new Predefined.StringType())]),
			{ optional: true },
		),
		new PropertySignature(
			new Identifier("ideal"), //
			new UnionType([new Predefined.StringType(), new ArrayType(new Predefined.StringType())]),
			{ optional: true },
		),
	]),

	new InterfaceDeclaration(
		"KeyboardEventInit",
		[
			new PropertySignature(
				new Identifier("charCode"), //
				new Predefined.NumberType(),
				{ optional: true, doc: new DocString(" @deprecated ") },
			),
			new PropertySignature(
				new Identifier("code"), //
				new Predefined.StringType(),
				{ optional: true },
			),
			new PropertySignature(
				new Identifier("isComposing"), //
				new Predefined.BooleanType(),
				{ optional: true },
			),
			new PropertySignature(
				new Identifier("key"), //
				new Predefined.StringType(),
				{ optional: true },
			),
			new PropertySignature(
				new Identifier("keyCode"), //
				new Predefined.NumberType(),
				{ optional: true, doc: new DocString(" @deprecated ") },
			),
			new PropertySignature(
				new Identifier("location"), //
				new Predefined.NumberType(),
				{ optional: true },
			),
			new PropertySignature(
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
			new PropertySignature(
				new Identifier("highWaterMark"), //
				new Predefined.NumberType(),
				{
					modifiers: ["readonly"],
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy/highWaterMark) ",
					),
				},
			),
			new PropertySignature(
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

	new VariableStatement(
		[
			new VariableDeclaration(
				new Identifier("BroadcastChannel"),
				new ObjectType([
					new Comment(" new(name: string): BroadcastChannel;"),
					new PropertySignature(
						new Identifier("prototype"), //
						new TypeReference(new Identifier("BroadcastChannel")),
					),
					new ConstructSignature(
						[new Parameter(new Identifier("name"), new Predefined.StringType())],
						new TypeReference(new Identifier("BroadcastChannel")),
					),
				]),
			),
		],
		{
			kind: VariableKind.Var,
			declared: true,
		},
	),

	new VariableStatement(
		[
			new VariableDeclaration(
				new Identifier("ByteLengthQueuingStrategy"),
				new ObjectType([
					new PropertySignature(
						new Identifier("prototype"), //
						new TypeReference(new Identifier("ByteLengthQueuingStrategy")),
					),
					new ConstructSignature(
						[
							new Parameter(
								new Identifier("init"),
								new TypeReference(new Identifier("QueuingStrategyInit")),
							),
						],
						new TypeReference(new Identifier("ByteLengthQueuingStrategy")),
					),
				]),
			),
		],
		{
			kind: VariableKind.Var,
			declared: true,
		},
	),

	new InterfaceDeclaration(
		"CSSAnimation",
		[
			new PropertySignature(
				new Identifier("animationName"), //
				new Predefined.StringType(),
				{
					modifiers: ["readonly"],
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation/animationName) ",
					),
				},
			),
			new MethodSignature(
				new Identifier("addEventListener"),
				[
					new Parameter(new Identifier("type"), new TypeReference(new Identifier("K"))),
					new Parameter(
						new Identifier("listener"),
						new FunctionType(
							[
								new Parameter(
									new Identifier("this"), //
									new TypeReference(new Identifier("CSSAnimation")),
								),
								new Parameter(
									new Identifier("ev"), //
									new IndexedAccessType(
										new Identifier("AnimationEventMap"),
										new TypeReference(new Identifier("K")),
									),
								),
							],
							new Predefined.AnyType(),
						),
					),
					new Parameter(
						new Identifier("options"),
						new UnionType([
							new Predefined.BooleanType(),
							new TypeReference(new Identifier("AddEventListenerOptions")),
						]),
						{ optional: true },
					),
				],
				new Predefined.VoidType(),
				{
					generics: [
						new Generic(
							new Identifier("K"),
							new KeyOfOperator(new TypeReference(new Identifier("AnimationEventMap"))),
						),
					],
				},
			),
			new MethodSignature(
				new Identifier("addEventListener"),
				[
					new Parameter(new Identifier("type"), new Predefined.StringType()),
					new Parameter(
						new Identifier("listener"),
						new TypeReference(new Identifier("EventListenerOrEventListenerObject")),
					),
					new Parameter(
						new Identifier("options"),
						new UnionType([
							new Predefined.BooleanType(),
							new TypeReference(new Identifier("AddEventListenerOptions")),
						]),
						{ optional: true },
					),
				],
				new Predefined.VoidType(),
			),
			new MethodSignature(
				new Identifier("removeEventListener"),
				[
					new Parameter(new Identifier("type"), new TypeReference(new Identifier("K"))),
					new Parameter(
						new Identifier("listener"),
						new FunctionType(
							[
								new Parameter(
									new Identifier("this"), //
									new TypeReference(new Identifier("CSSAnimation")),
								),
								new Parameter(
									new Identifier("ev"), //
									new IndexedAccessType(
										new Identifier("AnimationEventMap"),
										new TypeReference(new Identifier("K")),
									),
								),
							],
							new Predefined.AnyType(),
						),
					),
					new Parameter(
						new Identifier("options"),
						new UnionType([
							new Predefined.BooleanType(),
							new TypeReference(new Identifier("EventListenerOptions")),
						]),
						{ optional: true },
					),
				],
				new Predefined.VoidType(),
				{
					generics: [
						new Generic(
							new Identifier("K"),
							new KeyOfOperator(new TypeReference(new Identifier("AnimationEventMap"))),
						),
					],
				},
			),
			new MethodSignature(
				new Identifier("removeEventListener"),
				[
					new Parameter(new Identifier("type"), new Predefined.StringType()),
					new Parameter(
						new Identifier("listener"),
						new TypeReference(new Identifier("EventListenerOrEventListenerObject")),
					),
					new Parameter(
						new Identifier("options"),
						new UnionType([
							new Predefined.BooleanType(),
							new TypeReference(new Identifier("EventListenerOptions")),
						]),
						{ optional: true },
					),
				],
				new Predefined.VoidType(),
			),
		],
		{
			extends: [new TypeReference(new Identifier("Animation"))],
			doc: new DocString(" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSAnimation) "),
		},
	),

	new InterfaceDeclaration(
		"CSSGroupingRule",
		[
			new PropertySignature(
				new Identifier("cssRules"), //
				new TypeReference(new Identifier("CSSRuleList")),
				{
					modifiers: ["readonly"],
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule/cssRules) ",
					),
				},
			),
			new MethodSignature(
				new Identifier("deleteRule"),
				[new Parameter(new Identifier("index"), new Predefined.NumberType())],
				new Predefined.VoidType(),
				{
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule/deleteRule) ",
					),
				},
			),
			new MethodSignature(
				new Identifier("insertRule"),
				[
					new Parameter(new Identifier("rule"), new Predefined.StringType()),
					new Parameter(new Identifier("index"), new Predefined.NumberType(), { optional: true }),
				],
				new Predefined.NumberType(),
				{
					doc: new DocString(
						" [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSGroupingRule/insertRule) ",
					),
				},
			),
		],
		{
			extends: [new TypeReference(new Identifier("CSSRule"))],
		},
	),

	new InterfaceDeclaration("AbstractWorker", [
		new PropertySignature(
			new Identifier("onerror"), //
			new UnionType([
				new FunctionType(
					[
						new Parameter(
							new Identifier("this"), //
							new TypeReference(new Identifier("AbstractWorker")),
						),
						new Parameter(
							new Identifier("ev"), //
							new TypeReference(new Identifier("ErrorEvent")),
						),
					],
					new Predefined.AnyType(),
				),
				new Literal.NullType(),
			]),
			{
				doc: new DocString(
					" [MDN Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorker/error_event) ",
				),
			},
		),
	]),

	new InterfaceDeclaration("AbortSignalEventMap", [
		new PropertySignature(
			new Literal.StringType("abort"), //
			new TypeReference(new Identifier("Event")),
		),
	]),
];

test("DeclarationFile", () => {
	assertParser(DeclarationFile.parser, testSource, new DeclarationFile(expectFixture));
});

test("parse", () => {
	assertParserFn(parse, testSource, new DeclarationFile(expectFixture));
});
