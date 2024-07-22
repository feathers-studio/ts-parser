import { choice, Parser, str } from "npm:arcsecond";

/*
PredefinedType:
	any
	number
	boolean
	string
	symbol (defined in primitives)
	bigint
	void
	never
*/

export declare namespace Predefined {
	interface Any {
		type: "predefined";
		value: "any";
	}

	interface Number {
		primitive: true;
		type: "number";
		value: null;
	}

	interface Boolean {
		primitive: true;
		type: "boolean";
		value: null;
	}

	interface BigInt {
		primitive: true;
		type: "bigint";
		value: null;
	}

	interface String {
		primitive: true;
		type: "string";
		value: null;
	}

	interface Void {
		type: "predefined";
		value: "void";
	}

	interface Never {
		type: "predefined";
		value: "never";
	}
}

export type PredefinedType =
	| Predefined.Any
	| Predefined.Number
	| Predefined.Boolean
	| Predefined.BigInt
	| Predefined.String
	| Predefined.Void
	| Predefined.Never;

export const anyType: Parser<Predefined.Any> = str("any") //
	.map(() => ({ type: "predefined", value: "any" }));

export const number: Parser<Predefined.Number> = str("number") //
	.map(() => ({ primitive: true, type: "number", value: null }));

export const boolean: Parser<Predefined.Boolean> = str("boolean") //
	.map(() => ({ primitive: true, type: "boolean", value: null }));

export const bigint: Parser<Predefined.BigInt> = str("bigint") //
	.map(value => ({ primitive: true, type: "bigint", value: null }));

export const string: Parser<Predefined.String> = str("string") //
	.map(() => ({ primitive: true, type: "string", value: null }));

export const voidType: Parser<Predefined.Void> = str("void") //
	.map(() => ({ type: "predefined", value: "void" }));

export const never: Parser<Predefined.Never> = str("never") //
	.map(() => ({ type: "predefined", value: "never" }));

export const PredefinedType: Parser<PredefinedType> = choice([
	anyType,
	number,
	boolean,
	bigint,
	string,
	voidType,
	never,
]);
