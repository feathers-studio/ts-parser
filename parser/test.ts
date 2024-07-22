import { parser } from "./index.ts";
import { assertParser } from "./utils.ts";

Deno.test("parse", () => {
	assertParser(
		parser,
		`
/// <reference path="./iterable.d.ts" />

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
			{ type: "reference", path: "./iterable.d.ts" },
			{
				type: "comment",
				text: "///////////////////////////",
				multi: false,
			},
			{ type: "comment", text: "/ Window APIs", multi: false },
			{
				type: "comment",
				text: "///////////////////////////",
				multi: false,
			},
			{
				type: "interface",
				doc: null,
				name: "AddEventListenerOptions",
				extends: [
					{
						type: "type-reference",
						name: { type: "identifier", name: "EventListenerOptions" },
						typeArguments: null,
					},
				],
				members: [
					{
						type: "member",
						doc: null,
						modifier: [],
						optional: true,
						key: { type: "identifier", name: "once" },
						value: { primitive: true, type: "boolean", value: null },
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						optional: true,
						key: { type: "identifier", name: "passive" },
						value: { primitive: true, type: "boolean", value: null },
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						optional: true,
						key: { type: "identifier", name: "signal" },
						value: {
							type: "type-reference",
							name: { type: "identifier", name: "AbortSignal" },
							typeArguments: null,
						},
					},
				],
			},
			{
				type: "interface",
				doc: null,
				name: "ComputedKeyframe",
				extends: null,
				members: [
					{
						type: "member",
						doc: null,
						modifier: [],
						optional: false,
						key: { type: "identifier", name: "composite" },
						value: {
							type: "type-reference",
							name: { type: "identifier", name: "CompositeOperationOrAuto" },
							typeArguments: null,
						},
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						optional: false,
						key: { type: "identifier", name: "computedOffset" },
						value: { primitive: true, type: "number", value: null },
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						optional: false,
						key: { type: "identifier", name: "easing" },
						value: { primitive: true, type: "string", value: null },
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						optional: false,
						key: { type: "identifier", name: "offset" },
						value: {
							type: "union",
							types: [
								{ primitive: true, type: "number", value: null },
								{ primitive: true, type: "null" },
							],
						},
					},
					{
						type: "member",
						doc: null,
						optional: false,
						modifier: [],
						key: {
							type: "index-key",
							key: "property",
							indexType: { primitive: true, type: "string", value: null },
						},
						value: {
							type: "union",
							types: [
								{ primitive: true, type: "string", value: null },
								{
									type: "union",
									types: [
										{ primitive: true, type: "number", value: null },
										{
											type: "union",
											types: [
												{ primitive: true, type: "null" },
												{ primitive: true, type: "undefined" },
											],
										},
									],
								},
							],
						},
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						optional: true,
						key: { type: "identifier", name: "init" },
						value: {
							type: "array",
							value: {
								type: "array",
								value: {
									primitive: true,
									type: "string",
									value: null,
								},
							},
						},
					},
				],
			},
			{
				doc: null,
				type: "interface",
				name: "KeyboardEventInit",
				extends: [
					{
						type: "type-reference",
						name: { type: "identifier", name: "EventModifierInit" },
						typeArguments: null,
					},
				],
				members: [
					{
						doc: {
							doc: " @deprecated ",
							type: "docString",
						},
						modifier: [],
						optional: true,
						type: "member",
						key: {
							type: "identifier",
							name: "charCode",
						},
						value: {
							primitive: true,
							type: "number",
							value: null,
						},
					},
					{
						doc: null,
						modifier: [],
						optional: true,
						type: "member",
						key: {
							type: "identifier",
							name: "code",
						},
						value: {
							primitive: true,
							type: "string",
							value: null,
						},
					},
					{
						doc: null,
						modifier: [],
						optional: true,
						type: "member",
						key: {
							type: "identifier",
							name: "isComposing",
						},
						value: {
							primitive: true,
							type: "boolean",
							value: null,
						},
					},
					{
						doc: null,
						modifier: [],
						optional: true,
						type: "member",
						key: {
							type: "identifier",
							name: "key",
						},
						value: {
							primitive: true,
							type: "string",
							value: null,
						},
					},
					{
						doc: {
							doc: " @deprecated ",
							type: "docString",
						},
						modifier: [],
						optional: true,
						type: "member",
						key: {
							type: "identifier",
							name: "keyCode",
						},
						value: {
							primitive: true,
							type: "number",
							value: null,
						},
					},
					{
						doc: null,
						modifier: [],
						optional: true,
						type: "member",
						key: {
							type: "identifier",
							name: "location",
						},
						value: {
							primitive: true,
							type: "number",
							value: null,
						},
					},
					{
						doc: null,
						modifier: [],
						optional: true,
						type: "member",
						key: {
							type: "identifier",
							name: "repeat",
						},
						value: {
							primitive: true,
							type: "boolean",
							value: null,
						},
					},
				],
			},
		],
	);
});
