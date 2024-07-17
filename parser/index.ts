import { assert, assertEquals } from "jsr:@std/assert@1.0.0";
import { choice, many, sequenceOf } from "npm:arcsecond";
import { reference } from "./reference.ts";
import { anyComment } from "./comment.ts";
import { ends, nonNull, ws } from "./utils.ts";
import { iface } from "./interface/index.ts";

const FileHeader = many(choice([reference, ws, anyComment])) //
	.map(defs => defs.filter(nonNull));

export const TypeScriptDefinitionFile = sequenceOf([FileHeader, many(choice([ws, anyComment, iface]))]) //
	.map(stuff => stuff.flat().filter(nonNull));

export const parse = (lib: string) => ends(TypeScriptDefinitionFile).run(lib);

Deno.test("parse", () => {
	const source = `
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
`;
	const result = parse(source);

	assertEquals(result, {
		isError: false,
		result: [
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
				extends: "EventListenerOptions",
				members: [
					{
						type: "member",
						doc: null,
						modifier: [],
						name: { type: "identifier", value: "once" },
						optional: true,
						defn: { primitive: true, type: "boolean", value: null },
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						name: { type: "identifier", value: "passive" },
						optional: true,
						defn: { primitive: true, type: "boolean", value: null },
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						name: { type: "identifier", value: "signal" },
						optional: true,
						defn: { type: "identifier", value: "AbortSignal" },
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
						name: { type: "identifier", value: "composite" },
						optional: false,
						defn: { type: "identifier", value: "CompositeOperationOrAuto" },
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						name: { type: "identifier", value: "computedOffset" },
						optional: false,
						defn: { primitive: true, type: "number", value: null },
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						name: { type: "identifier", value: "easing" },
						optional: false,
						defn: { primitive: true, type: "string", value: null },
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						name: { type: "identifier", value: "offset" },
						optional: false,
						defn: {
							type: "union",
							options: [
								{ primitive: true, type: "number", value: null },
								{ primitive: true, type: "null" },
							],
						},
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						name: {
							type: "index-key",
							name: "property",
							indexType: { primitive: true, type: "string", value: null },
						},
						optional: false,
						defn: {
							type: "union",
							options: [
								{ primitive: true, type: "string", value: null },
								{ primitive: true, type: "number", value: null },
								{ primitive: true, type: "null" },
								{ primitive: true, type: "undefined" },
							],
						},
					},
					{
						type: "member",
						doc: null,
						modifier: [],
						name: { type: "identifier", value: "init" },
						optional: true,
						defn: {
							type: "array",
							value: { type: "array", value: { primitive: true, type: "string", value: null } },
						},
					},
				],
			},
		],
		index: 460,
		data: null,
	});
});

/* missing:

Interface type params

[ ] declare var
[ ] declare function
[ ] type

*/
