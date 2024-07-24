import { Parser, choice, many, possibly, sequenceOf, str, takeLeft, char } from "npm:arcsecond";
import { lazy, bracketed, wsed, wss, sepByN, init, last, seq, ws } from "./utils.ts";
import { Predefined } from "./predefined.ts";
import { Literal } from "./literal.ts";
import { Identifier } from "./identifier.ts";
import { DocString } from "./docString.ts";
import { ParserBase } from "./base.ts";

const arrayPostfix = bracketed(
	wss.map(() => "array"),
	"[",
);

export type NonArrayPrimaryType = PredefinedOrLiteralType | TypeReference | ObjectType | TupleType | ThisType;
export const NonArrayPrimaryType: Parser<NonArrayPrimaryType> = lazy(() =>
	choice([PredefinedOrLiteralType, TypeReference.parse, ObjectType.parse, TupleType.parse, ThisType.parse]),
);

export type PrimaryType = PredefinedOrLiteralType | TypeReference | ObjectType | ArrayType | TupleType | ThisType;
export const PrimaryType: Parser<Type> = lazy(() =>
	seq([choice([ParenthesisedType, NonArrayPrimaryType]), wss, many(arrayPostfix)]) //
		.map(([value, , postfixes]): Type => {
			if (postfixes.length) {
				const type = postfixes.reduce((value, suffix) => {
					if (suffix === "array") return ArrayType.from(value);
					throw new Error(`Unknown suffix: ${suffix}`);
				}, value as PrimaryType);
				return type;
			} else return value;
		}),
);

export class IntersectionType extends ParserBase {
	type: "intersection" = "intersection";

	private constructor(public types: Type[]) {
		super();
	}

	static from(types: Type[]) {
		return new IntersectionType(types);
	}

	static get parse(): Parser<IntersectionType> {
		return lazy(() =>
			seq([PrimaryType, wsed(str("&")), IntersectionOrPrimaryType]).map(
				([left, _, right]) => new IntersectionType([left, right]),
			),
		);
	}

	toString() {
		return this.types.join(" & ");
	}
}

export type IntersectionOrPrimaryType = IntersectionType | PrimaryType;
export const IntersectionOrPrimaryType = choice([IntersectionType.parse, PrimaryType]);

export class UnionType extends ParserBase {
	type: "union" = "union";

	private constructor(public types: Type[]) {
		super();
	}

	static from(types: Type[]) {
		return new UnionType(types);
	}

	static get parse(): Parser<UnionType> {
		return lazy(() =>
			seq([IntersectionOrPrimaryType, wsed(str("|")), UnionOrIntersectionOrPrimaryType]).map(
				([left, _, right]) => new UnionType([left, right]),
			),
		);
	}

	toString() {
		return this.types.join(" | ");
	}
}

export type UnionOrIntersectionOrPrimaryType = UnionType | IntersectionType | PrimaryType;
export const UnionOrIntersectionOrPrimaryType = choice([UnionType.parse, IntersectionOrPrimaryType]);

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
export type PredefinedOrLiteralType = Predefined.Type | Literal.Type;
export const PredefinedOrLiteralType: Parser<PredefinedOrLiteralType> = choice([Predefined.parse, Literal.parse]);

export const TypeParameters = bracketed(sepByN<Type>(char(","), 1)(wsed(Type)), "<");

/*

Name = QualifiedName | Identifier
QualifiedName = Name . Identifier

*/

export class QualifiedName extends ParserBase {
	type: "qualified-name" = "qualified-name";

	private constructor(public left: TypeName, public name: Identifier) {
		super();
	}

	static from(left: TypeName, name: Identifier) {
		return new QualifiedName(left, name);
	}

	static get parse(): Parser<QualifiedName> {
		return lazy(() =>
			sepByN<Identifier>(
				char("."),
				2,
			)(Identifier.parse).map(
				names =>
					new QualifiedName(
						// @ts-ignore - left is inherently TypeName, but TS doesn't understand
						init(names).reduce((left, name) => new QualifiedName(left, name)),
						last(names),
					),
			),
		);
	}

	toString() {
		return `${this.left}.${this.name}`;
	}
}

export type TypeName = QualifiedName | Identifier;

export const TypeName: Parser<TypeName> = lazy(() => choice([QualifiedName.parse, Identifier.parse]));

export interface TypeReference {
	type: "type-reference";
	name: TypeName;
	typeArguments: Type[] | null;
}

export class TypeReference extends ParserBase {
	type: "type-reference" = "type-reference";

	typeArguments: Type[] | null;

	private constructor(public name: TypeName, typeArguments?: Type[] | null) {
		super();
		this.typeArguments = typeArguments ?? null;
	}

	static from(name: TypeName, typeArguments?: Type[] | null) {
		return new TypeReference(name, typeArguments);
	}

	static get parse(): Parser<TypeReference> {
		return lazy(() =>
			seq([TypeName, possibly(TypeParameters)]).map(
				([name, typeArguments]) => new TypeReference(name, typeArguments),
			),
		);
	}

	toString() {
		return `${this.name}${this.typeArguments ? "<" + this.typeArguments.join(", ") + ">" : ""}`;
	}
}

export class IndexKey extends ParserBase {
	type: "index-key" = "index-key";

	private constructor(public key: string, public indexType: Type) {
		super();
	}

	static from(key: string, indexType: Type) {
		return new IndexKey(key, indexType);
	}

	static get parse(): Parser<IndexKey> {
		return lazy(() =>
			sequenceOf([str("["), wsed(Identifier.parse), str(":"), wsed(Type), str("]")]) //
				.map(([_, name, __, indexType]) => new IndexKey(name.name, indexType)),
		);
	}

	toString() {
		return `[${this.key}: ${this.indexType}]`;
	}
}

export type Modifier = "readonly" | "public" | "private" | "protected";
export const Modifier: Parser<Modifier> = choice([
	str("readonly"),
	str("public"),
	str("private"),
	str("protected"),
]) as Parser<Modifier>;

export class Member extends ParserBase {
	type: "member" = "member";

	doc: DocString | null;
	modifier: Modifier[];
	optional: boolean;

	private constructor(
		public key: Identifier | IndexKey,
		public value: Type,
		extra?: {
			doc?: DocString | null;
			modifier?: Modifier[];
			optional?: boolean;
		},
	) {
		super();
		this.doc = extra?.doc ?? null;
		this.modifier = extra?.modifier ?? [];
		this.optional = extra?.optional ?? false;
	}

	static from(
		key: Identifier | IndexKey,
		value: Type,
		extra?: {
			doc?: DocString | null;
			modifier?: Modifier[];
			optional?: boolean;
		},
	) {
		return new Member(key, value, extra);
	}

	static get parse(): Parser<Member> {
		return lazy(() =>
			sequenceOf([
				possibly(DocString.parse),
				wsed(many(takeLeft(Modifier)(ws) as Parser<Modifier>)),
				wsed(choice([Identifier.parse, IndexKey.parse])),
				possibly(char("?")).map(c => c != null),
				wsed(str(":")),
				wsed(Type),
			] as const).map(
				([doc, modifier, key, optional, , value]) => new Member(key, value, { doc, modifier, optional }),
			),
		);
	}

	toString() {
		let out = "";

		if (this.doc) out += this.doc + "\n\t";
		if (this.modifier.length) out += this.modifier.join(" ") + " ";
		out += `${this.key}${this.optional ? "?" : ""}: ${this.value};`;

		return out;
	}
}

const PropertySeparator = choice([char(";"), char(",")]);

export class ObjectType extends ParserBase {
	type: "object" = "object";

	doc: DocString | null;

	private constructor(public members: Member[], extra?: { doc?: DocString }) {
		super();
		this.doc = extra?.doc ?? null;
	}

	static from(members: Member[], extra?: { doc?: DocString }) {
		return new ObjectType(members, extra);
	}

	static get parse(): Parser<ObjectType> {
		return lazy(() =>
			bracketed(
				seq([
					wsed(Member.parse),
					many(seq([PropertySeparator, wsed(Member.parse)]).map(([, member]) => member)), //
					possibly(wsed(PropertySeparator)),
				]).map(([member, members]) => [member, ...members]),
				"{",
			) //
				.map(members => new ObjectType(members)),
		);
	}

	toString() {
		return `{\n${this.members.join("\n")}\n}`;
	}
}

export class ArrayType extends ParserBase {
	type: "array" = "array";

	private constructor(public value: Type) {
		super();
	}

	static from(value: Type) {
		return new ArrayType(value);
	}

	static get parse(): Parser<ArrayType> {
		return lazy(() => bracketed(wsed(Type), "[").map(value => new ArrayType(value)));
	}

	toString() {
		return `${this.value}[]`;
	}
}

export class TupleType extends ParserBase {
	type: "tuple" = "tuple";

	private constructor(public values: Type[]) {
		super();
	}

	static from(values: Type[]) {
		return new TupleType(values);
	}

	static get parse(): Parser<TupleType> {
		return lazy(() => bracketed(sepByN<Type>(char(","), 0)(wsed(Type)), "[").map(values => new TupleType(values)));
	}

	toString() {
		return `[${this.values.join(", ")}]`;
	}
}

export class ThisType extends ParserBase {
	type: "this" = "this";

	static get parse(): Parser<ThisType> {
		return str("this").map(() => new ThisType());
	}

	static from() {
		return new ThisType();
	}

	toString() {
		return "this";
	}
}
