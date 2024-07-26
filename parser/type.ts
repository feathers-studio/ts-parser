import { Parser, choice, many, possibly, sequenceOf, str, takeLeft, char } from "npm:arcsecond";
import { lazy, bracketed, surroundWhitespace, wss, sepByN, init, last, seq, ws } from "./utils.ts";
import { Predefined } from "./predefined.ts";
import { Literal } from "./literal.ts";
import { Identifier } from "./identifier.ts";
import { DocString } from "./docString.ts";
import { ParserBase, SyntaxKind } from "./base.ts";

const arrayPostfix = bracketed(
	wss.map(() => "array"),
	"[",
);

export type NonArrayPrimaryType = PredefinedOrLiteralType | TypeReference | ObjectType | TupleType | ThisType;
export const NonArrayPrimaryType: Parser<NonArrayPrimaryType> = lazy(() =>
	choice([PredefinedOrLiteralType, TypeReference.parser, ObjectType.parser, TupleType.parser, ThisType.parser]),
);

export type PrimaryType = PredefinedOrLiteralType | TypeReference | ObjectType | ArrayType | TupleType | ThisType;
export const PrimaryType: Parser<Type> = lazy(() =>
	seq([choice([ParenthesisedType, NonArrayPrimaryType]), wss, many(arrayPostfix)]) //
		.map(([value, , postfixes]): Type => {
			if (postfixes.length) {
				const type = postfixes.reduce((value, suffix) => {
					if (suffix === "array") return new ArrayType(value);
					throw new Error(`Unknown suffix: ${suffix}`);
				}, value as PrimaryType);
				return type;
			} else return value;
		}),
);

export class IntersectionType extends ParserBase {
	kind: SyntaxKind.IntersectionType = SyntaxKind.IntersectionType;

	constructor(public types: [left: Type, right: Type]) {
		super();
	}

	static parser: Parser<IntersectionType> = lazy(() =>
		seq([PrimaryType, surroundWhitespace(str("&")), IntersectionOrPrimaryType]).map(
			([left, _, right]) => new IntersectionType([left, right]),
		),
	);

	toString() {
		const [left, right] = this.types;
		let out = "";

		if (left.kind === SyntaxKind.UnionType) out += "(" + left + ")";
		else out += left;

		out += " & ";

		if (right.kind === SyntaxKind.UnionType) out += "(" + right + ")";
		else out += right;

		return out;
	}
}

export type IntersectionOrPrimaryType = IntersectionType | PrimaryType;
export const IntersectionOrPrimaryType = choice([IntersectionType.parser, PrimaryType]);

export class UnionType extends ParserBase {
	kind: SyntaxKind.UnionType = SyntaxKind.UnionType;

	constructor(public types: [left: Type, right: Type]) {
		super();
	}

	static parser: Parser<UnionType> = lazy(() =>
		seq([IntersectionOrPrimaryType, surroundWhitespace(str("|")), UnionOrIntersectionOrPrimaryType]).map(
			([left, _, right]) => new UnionType([left, right]),
		),
	);

	toString() {
		const [left, right] = this.types;
		let out = "";

		if (left.kind === SyntaxKind.IntersectionType) out += "(" + left + ")";
		else out += left;

		out += " | ";

		if (right.kind === SyntaxKind.IntersectionType) out += "(" + right + ")";
		else out += right;

		return out;
	}
}

export type UnionOrIntersectionOrPrimaryType = UnionType | IntersectionType | PrimaryType;
export const UnionOrIntersectionOrPrimaryType = choice([UnionType.parser, IntersectionOrPrimaryType]);

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

export const ParenthesisedType = bracketed(surroundWhitespace(Type), "(");
export type PredefinedOrLiteralType = Predefined.Type | Literal.Type;
export const PredefinedOrLiteralType: Parser<PredefinedOrLiteralType> = choice([Predefined.parse, Literal.parse]);

export const TypeParameters = bracketed(sepByN<Type>(char(","), 1)(surroundWhitespace(Type)), "<");

/*

Name = QualifiedName | Identifier
QualifiedName = Name . Identifier

*/

export class QualifiedName extends ParserBase {
	kind: SyntaxKind.QualifiedName = SyntaxKind.QualifiedName;

	constructor(public left: TypeName, public name: Identifier) {
		super();
	}

	static parser: Parser<QualifiedName> = lazy(() =>
		sepByN<Identifier>(
			char("."),
			2,
		)(Identifier.parser).map(
			names =>
				new QualifiedName(
					// @ts-ignore - left is inherently TypeName, but TS doesn't understand
					init(names).reduce((left, name) => new QualifiedName(left, name)),
					last(names),
				),
		),
	);

	toString() {
		return `${this.left}.${this.name}`;
	}
}

export type TypeName = QualifiedName | Identifier;

export const TypeName: Parser<TypeName> = lazy(() => choice([QualifiedName.parser, Identifier.parser]));

export class TypeReference extends ParserBase {
	kind: SyntaxKind.TypeReference = SyntaxKind.TypeReference;

	typeArguments: Type[] | null;

	constructor(public name: TypeName, typeArguments?: Type[] | null) {
		super();
		this.typeArguments = typeArguments ?? null;
	}

	static parser: Parser<TypeReference> = lazy(() =>
		seq([TypeName, possibly(TypeParameters)]).map(
			([name, typeArguments]) => new TypeReference(name, typeArguments),
		),
	);

	toString() {
		return `${this.name}${this.typeArguments ? "<" + this.typeArguments.join(", ") + ">" : ""}`;
	}
}

export class IndexSignature extends ParserBase {
	kind: SyntaxKind.IndexSignature = SyntaxKind.IndexSignature;

	constructor(public key: string, public indexType: Type) {
		super();
	}

	static parser: Parser<IndexSignature> = lazy(() =>
		sequenceOf([str("["), surroundWhitespace(Identifier.parser), str(":"), surroundWhitespace(Type), str("]")]) //
			.map(([_, name, __, indexType]) => new IndexSignature(name.name, indexType)),
	);

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

export class PropertySignature extends ParserBase {
	kind: SyntaxKind.PropertySignature = SyntaxKind.PropertySignature;

	doc: DocString | null;
	modifiers: Modifier[];
	optional: boolean;

	constructor(
		public key: Identifier | IndexSignature,
		public value: Type,
		extra?: {
			doc?: DocString | null;
			modifiers?: Modifier[];
			optional?: boolean;
		},
	) {
		super();
		this.doc = extra?.doc ?? null;
		this.modifiers = extra?.modifiers ?? [];
		this.optional = extra?.optional ?? false;
	}

	static parser: Parser<PropertySignature> = lazy(() =>
		sequenceOf([
			possibly(DocString.parser),
			surroundWhitespace(many(takeLeft(Modifier)(ws) as Parser<Modifier>)),
			surroundWhitespace(choice([Identifier.parser, IndexSignature.parser])),
			possibly(char("?")).map(c => c != null),
			surroundWhitespace(str(":")),
			surroundWhitespace(Type),
		] as const).map(
			([doc, modifiers, key, optional, , value]) =>
				new PropertySignature(key, value, { doc, modifiers, optional }),
		),
	);

	toString() {
		let out = "";

		if (this.doc) out += this.doc + "\n\t";
		if (this.modifiers.length) out += this.modifiers.join(" ") + " ";
		out += this.key + (this.optional ? "?" : "") + ": " + this.value;

		return out;
	}
}

const PropertySeparator = choice([char(";"), char(",")]);

export class ObjectType extends ParserBase {
	kind: SyntaxKind.ObjectType = SyntaxKind.ObjectType;

	doc: DocString | null;

	constructor(public members: PropertySignature[], extra?: { doc?: DocString }) {
		super();
		this.doc = extra?.doc ?? null;
	}

	static parser: Parser<ObjectType> = lazy(() =>
		choice([
			bracketed(
				seq([
					surroundWhitespace(PropertySignature.parser),
					many(
						seq([PropertySeparator, surroundWhitespace(PropertySignature.parser)]).map(
							([, member]) => member,
						),
					), //
					possibly(surroundWhitespace(PropertySeparator)),
				]).map(([member, members]) => [member, ...members]),
				"{",
			) //
				.map(members => new ObjectType(members ?? [])),
			bracketed(wss, "{").map(() => new ObjectType([])),
		]),
	);

	toString() {
		let out = "{\n";

		if (this.doc) out += this.doc + "\n";
		if (this.members.length) out += this.members.join(";\n") + ";";

		return out + "\n}";
	}
}

export class ArrayType extends ParserBase {
	kind: SyntaxKind.ArrayType = SyntaxKind.ArrayType;

	constructor(public value: Type) {
		super();
	}

	static parser: Parser<ArrayType> = lazy(() =>
		bracketed(surroundWhitespace(Type), "[").map(value => new ArrayType(value)),
	);

	toString() {
		if (this.value.kind === SyntaxKind.UnionType || this.value.kind === SyntaxKind.IntersectionType)
			return "(" + this.value + ")[]";
		else return this.value + "[]";
	}
}

export class TupleType extends ParserBase {
	kind: SyntaxKind.TupleType = SyntaxKind.TupleType;

	constructor(public values: Type[]) {
		super();
	}

	static parser: Parser<TupleType> = lazy(() =>
		bracketed(sepByN<Type>(char(","), 0)(surroundWhitespace(Type)), "[").map(values => new TupleType(values)),
	);

	toString() {
		return `[${this.values.join(", ")}]`;
	}
}

export class ThisType extends ParserBase {
	kind: SyntaxKind.ThisType = SyntaxKind.ThisType;

	static parser: Parser<ThisType> = str("this").map(() => new ThisType());

	toString() {
		return "this";
	}
}
