import { parser } from "./index.ts";
import { assertParser } from "./utils.ts";

import { Comment } from "./comment.ts";
import { Reference } from "./reference.ts";
import { InterfaceDeclaration } from "./interface.ts";
import { ArrayType, IndexKey, Member, TypeReference, UnionType } from "./type.ts";
import { DocString } from "./docString.ts";
import { Predefined } from "./predefined.ts";
import { Literal } from "./literal.ts";
import { Identifier } from "./identifier.ts";

Deno.test("parse", () => {
	assertParser(
		parser,
		`
/// Extract from lib.dom.d.ts
/// <reference path="./iterable.d.ts" />

/* Source is from @types/web */

/////////////////////////////
/// Window APIs
/////////////////////////////

interface AddEventListenerOptions extends EventListenerOptions {
	once?: boolean;
	passive?: boolean;
	signal?: AbortSignal;
}

interface ComputedKeyframe {
	composite: CompositeOperationOrAuto;
	computedOffset: number;
	easing: string;
	offset: number | null;
	[property: string]: string | number | null | undefined;
	init?: string[][];
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
}`,
		[
			Comment.single("/ Extract from lib.dom.d.ts"),
			Reference.from("./iterable.d.ts"),
			Comment.multi(" Source is from @types/web "),
			Comment.single("///////////////////////////"),
			Comment.single("/ Window APIs"),
			Comment.single("///////////////////////////"),

			InterfaceDeclaration.from(
				"AddEventListenerOptions",
				[
					Member.from(Identifier.from("once"), Predefined.Boolean.from(), { optional: true }),
					Member.from(Identifier.from("passive"), Predefined.Boolean.from(), { optional: true }),
					Member.from(Identifier.from("signal"), TypeReference.from(Identifier.from("AbortSignal")), {
						optional: true,
					}),
				],
				{
					extends: [TypeReference.from(Identifier.from("EventListenerOptions"))],
				},
			),

			InterfaceDeclaration.from("ComputedKeyframe", [
				Member.from(
					Identifier.from("composite"),
					TypeReference.from(Identifier.from("CompositeOperationOrAuto"), null),
				),
				Member.from(Identifier.from("computedOffset"), Predefined.Number.from()),
				Member.from(Identifier.from("easing"), Predefined.String.from()),
				Member.from(Identifier.from("offset"), UnionType.from([Predefined.Number.from(), Literal.Null.from()])),
				Member.from(
					IndexKey.from("property", Predefined.String.from()),
					UnionType.from([
						Predefined.String.from(),
						UnionType.from([
							Predefined.Number.from(),
							UnionType.from([Literal.Null.from(), Literal.Undefined.from()]),
						]),
					]),
				),
				Member.from(Identifier.from("init"), ArrayType.from(ArrayType.from(Predefined.String.from())), {
					optional: true,
				}),
			]),

			InterfaceDeclaration.from(
				"KeyboardEventInit",
				[
					Member.from(Identifier.from("charCode"), Predefined.Number.from(), {
						optional: true,
						doc: DocString.from(" @deprecated "),
					}),
					Member.from(Identifier.from("code"), Predefined.String.from(), { optional: true }),
					Member.from(Identifier.from("isComposing"), Predefined.Boolean.from(), {
						optional: true,
					}),
					Member.from(Identifier.from("key"), Predefined.String.from(), { optional: true }),
					Member.from(Identifier.from("keyCode"), Predefined.Number.from(), {
						optional: true,
						doc: DocString.from(" @deprecated "),
					}),
					Member.from(Identifier.from("location"), Predefined.Number.from(), { optional: true }),
					Member.from(Identifier.from("repeat"), Predefined.Boolean.from(), { optional: true }),
				],
				{
					extends: [TypeReference.from(Identifier.from("EventModifierInit"))],
				},
			),
		],
	);
});
