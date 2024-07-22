import { Parser, choice, many, possibly, sequenceOf, str, takeLeft, char } from "npm:arcsecond";
import { lazy, bracketed, wsed, wss, sepByN, init, last, seq, ws, assertParser } from "./utils.ts";
import { PredefinedType } from "./predefined.ts";
import { LiteralType } from "./literal.ts";
import { Identifier } from "./identifier.ts";
import { docString, DocString } from "./docString.ts";

const arrayPostfix = bracketed(
	wss.map(() => "array"),
	"[",
);

export type NonArrayPrimaryType = PredefinedOrLiteralType | TypeReference | ObjectType | TupleType | ThisType;
export const NonArrayPrimaryType: Parser<NonArrayPrimaryType> = lazy(() =>
	choice([PredefinedOrLiteralType, TypeReference, ObjectType, TupleType, ThisType]),
);

export type PrimaryType = PredefinedOrLiteralType | TypeReference | ObjectType | ArrayType | TupleType | ThisType;
export const PrimaryType: Parser<Type> = lazy(() =>
	seq([choice([ParenthesisedType, NonArrayPrimaryType]), wss, many(arrayPostfix)]) //
		.map(([value, , postfixes]): Type => {
			if (postfixes.length) {
				const type = postfixes.reduce((value, suffix) => {
					if (suffix === "array") return { type: "array", value } as const;
					throw new Error(`Unknown suffix: ${suffix}`);
				}, value as PrimaryType);
				return type;
			} else return value;
		}),
);

export interface IntersectionType {
	type: "intersection";
	types: Type[];
}

export const IntersectionType: Parser<IntersectionType> = lazy(() =>
	seq([PrimaryType, wsed(str("&")), IntersectionOrPrimaryType]).map(([left, _, right]) => ({
		type: "intersection",
		types: [left, right],
	})),
);

export type IntersectionOrPrimaryType = IntersectionType | PrimaryType;
export const IntersectionOrPrimaryType = choice([IntersectionType, PrimaryType]);

export interface UnionType {
	type: "union";
	types: Type[];
}

export const UnionType: Parser<UnionType> = lazy(() =>
	seq([IntersectionOrPrimaryType, wsed(str("|")), UnionOrIntersectionOrPrimaryType]).map(([left, _, right]) => ({
		type: "union",
		types: [left, right],
	})),
);

export type UnionOrIntersectionOrPrimaryType = UnionType | IntersectionType | PrimaryType;
export const UnionOrIntersectionOrPrimaryType = choice([UnionType, IntersectionOrPrimaryType]);

export type Type = UnionType | IntersectionType | PrimaryType;
export const Type = lazy(() => choice([UnionOrIntersectionOrPrimaryType]));

/**
PrimaryType:
   ParenthesizedType
   PredefinedType
   TypeReference
   ObjectType
   ArrayType
   TupleType
   TypeQuery
   ThisType
 */

export const ParenthesisedType = bracketed(wsed(Type), "(");
export type PredefinedOrLiteralType = PredefinedType | LiteralType;
export const PredefinedOrLiteralType: Parser<PredefinedOrLiteralType> = choice([PredefinedType, LiteralType]);

export const TypeParameters = bracketed(sepByN<Type>(char(","), 1)(wsed(Type)), "<");

/*

Name = QualifiedName | Identifier
QualifiedName = Name . Identifier

*/

export interface QualifiedName {
	type: "qualified-name";
	left: TypeName;
	name: Identifier;
}

export const QualifiedName: Parser<QualifiedName> = lazy(() =>
	sepByN<Identifier>(
		char("."),
		2,
	)(Identifier).map(names => ({
		type: "qualified-name",
		// @ts-ignore - left is inherently TypeName, but TS doesn't understand
		left: init(names).reduce((left, name) => ({ type: "qualified-name", left, name })) as TypeName,
		name: last(names),
	})),
);

export type TypeName = QualifiedName | Identifier;

export const TypeName: Parser<TypeName> = lazy(() => choice([QualifiedName, Identifier]));

export interface TypeReference {
	type: "type-reference";
	name: TypeName;
	typeArguments: Type[] | null;
}

export const TypeReference: Parser<TypeReference> = sequenceOf([TypeName, possibly(TypeParameters)]) //
	.map(([name, typeArguments]) => ({ type: "type-reference", name, typeArguments }));

export interface IndexKey {
	type: "index-key";
	key: string;
	indexType: Type;
}

export const indexKey: Parser<IndexKey> = lazy(() =>
	sequenceOf([str("["), wsed(Identifier), str(":"), wsed(Type), str("]")]) //
		.map(([_, name, __, indexType]) => ({ type: "index-key", key: name.name, indexType })),
);

export type Modifier = "readonly" | "public" | "private" | "protected";
export const Modifier: Parser<Modifier> = choice([
	str("readonly"),
	str("public"),
	str("private"),
	str("protected"),
]) as Parser<Modifier>;

export interface Member {
	type: "member";
	doc: DocString | null;
	modifier: Modifier[];
	optional: boolean;
	key: Identifier | IndexKey;
	value: Type;
}

export const Member: Parser<Member> = lazy(() =>
	sequenceOf([
		possibly(docString),
		wsed(many(takeLeft(Modifier)(ws) as Parser<Modifier>)),
		wsed(choice([Identifier, indexKey])),
		possibly(char("?")).map(c => c != null),
		wsed(str(":")),
		wsed(Type),
	] as const).map(
		(
			[doc, modifier, key, optional, , value], //
		) => ({ type: "member", doc, modifier, key, optional, value }),
	),
);

export interface ObjectType {
	type: "object";
	members: Member[];
}

const PropertySeparator = choice([char(";"), char(",")]);

export const ObjectType: Parser<ObjectType> = lazy(() =>
	bracketed(
		seq([
			wsed(Member),
			many(seq([PropertySeparator, wsed(Member)]).map(([, member]) => member)), //
			possibly(wsed(PropertySeparator)),
		]).map(([member, members]) => [member, ...members]),
		"{",
	) //
		.map(members => ({ type: "object", members })),
);

export interface ArrayType {
	type: "array";
	value: Type;
}

export const ArrayType: Parser<ArrayType> = (takeLeft(wsed(Type))(bracketed(wss, "[")) as Parser<Type>) //
	.map(value => ({ type: "array", value }));

export interface TupleType {
	type: "tuple";
	values: Type[];
}

export const TupleType: Parser<TupleType> = bracketed(sepByN<Type>(char(","), 0)(wsed(Type)), "[") //
	.map(values => ({ type: "tuple", values }));

export interface ThisType {
	type: "this";
}

export const ThisType: Parser<ThisType> = str("this").map(() => ({ type: "this" }));
