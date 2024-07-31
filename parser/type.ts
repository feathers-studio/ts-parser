import {
	Parser,
	whitespace,
	choice,
	many,
	possibly,
	sequenceOf,
	str,
	takeLeft,
	char,
	optionalWhitespace,
	lookAhead,
} from "arcsecond";

import { lazy, bracketed, surroundWhitespace, sepByN, init, last, seq, spaces } from "./utils.ts";
import { Predefined } from "./predefined.ts";
import { Literal } from "./literal.ts";
import { Identifier } from "./identifier.ts";
import { DocString } from "./docString.ts";
import { ParserBase, SyntaxKind } from "./base.ts";
import { Comment } from "./comment.ts";

const arrayPostfix = seq([optionalWhitespace, char("["), optionalWhitespace, char("]")]).map(() => "array" as const);

export type NonArrayPrimaryType = PredefinedOrLiteralType | TypeReference | ObjectType | TupleType | ThisType;
export const NonArrayPrimaryType: Parser<NonArrayPrimaryType> = lazy(() =>
	choice([ThisType.parser, PredefinedOrLiteralType, TypeReference.parser, ObjectType.parser, TupleType.parser]),
);

export type PrimaryType = PredefinedOrLiteralType | TypeReference | ObjectType | ArrayType | TupleType | ThisType;
export const PrimaryType: Parser<Type> = lazy(() =>
	seq([choice([ParenthesisedType, NonArrayPrimaryType]), many(arrayPostfix)]) //
		.map(([value, postfixes]): Type => {
			if (postfixes.length)
				return postfixes.reduce((value, suffix) => {
					if (suffix === "array") return new ArrayType(value);
					throw new Error(`Unknown suffix: ${suffix}`);
				}, value as PrimaryType);
			else return value;
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

export const TypeParameters = bracketed(sepByN(char(","), 1)(surroundWhitespace(Type)), "<");

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
		sepByN(
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
export const Modifier: Parser<Modifier> = takeLeft(
	choice([str("readonly"), str("public"), str("private"), str("protected")]),
)(whitespace) as Parser<Modifier>;

const Ender = choice([char(";"), char(","), char("\n"), lookAhead(char("}"))]);

const PropertyWrap = <T>(parser: Parser<T>) =>
	surroundWhitespace(
		seq([
			//
			possibly(DocString.parser),
			optionalWhitespace,
			parser,
			possibly(spaces),
			Ender,
		]),
	).map(([doc, _1, value]) => [doc, value] as const);

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

	static parser: Parser<PropertySignature> = PropertyWrap(
		seq([
			surroundWhitespace(many(Modifier)),
			choice([Identifier.parser, IndexSignature.parser]),
			optionalWhitespace,
			possibly(char("?")).map(c => c != null),
			optionalWhitespace,
			str(":"),
			optionalWhitespace,
			Type,
			possibly(spaces),
		]),
	).map(
		([doc, [modifiers, key, _1, optional, _2, _3, _4, type]]) =>
			new PropertySignature(key, type, { doc, modifiers, optional }),
	);

	toString() {
		let out = "";

		if (this.doc) out += this.doc + "\n\t";
		if (this.modifiers.length) out += this.modifiers.join(" ") + " ";
		out += this.key + (this.optional ? "?" : "") + ": " + this.value + ";";

		return out;
	}
}

export class Parameter {
	kind: SyntaxKind.Parameter = SyntaxKind.Parameter;

	doc: DocString | null;
	optional: boolean;

	constructor(
		public name: Identifier,
		public type?: Type,
		extra?: {
			doc?: DocString | null;
			modifiers?: Modifier[];
			optional?: boolean;
		},
	) {
		this.doc = extra?.doc ?? null;
		this.optional = extra?.optional ?? false;
	}

	static parser: Parser<Parameter> = seq([
		possibly(surroundWhitespace(DocString.parser)),
		Identifier.parser,
		possibly(
			seq([optionalWhitespace, possibly(str("?")).map(c => c != null), surroundWhitespace(str(":")), Type]).map(
				([_, optional, __, type]) => ({ optional, type }),
			),
		),
	]).map(([doc, name, type]) => new Parameter(name, type?.type, { doc, optional: type?.optional }));

	toString() {
		let out = this.name.toString();
		if (this.optional) out += "?";
		out += ": " + this.type;
		return out;
	}
}

export class Generic {
	kind: SyntaxKind.Generic = SyntaxKind.Generic;

	constructor(public name: Identifier, public extendsType: Type | null = null) {}

	static parser: Parser<Generic> = seq([
		Identifier.parser,
		possibly(
			seq([optionalWhitespace, str("extends"), optionalWhitespace, Type]).map(([_, __, ___, types]) => types),
		),
	]).map(([name, extendsType]) => new Generic(name, extendsType));

	toString() {
		let out = this.name.toString();
		if (this.extendsType) out += " extends " + this.extendsType;
		return out;
	}
}

function stringifyMethodLike(
	name: string,
	{
		doc,
		generics,
		parameters,
		returnType,
	}: {
		doc: DocString | null;
		generics: Generic[];
		parameters: Parameter[];
		returnType: Type | null;
	},
) {
	let out = "";

	if (doc) out += doc + "\n\t";
	out += name;
	if (generics.length) out += "<" + generics.join(", ") + ">";
	out += " (";
	out += parameters.join(", ") + ")";
	if (returnType) out += ": " + returnType;
	return out + ";";
}

export class MethodSignature extends ParserBase {
	kind: SyntaxKind.MethodSignature = SyntaxKind.MethodSignature;

	doc: DocString | null;
	generics: Generic[];

	constructor(
		public name: Identifier,
		public parameters: Parameter[],
		public returnType: Type | null,
		extra?: {
			doc?: DocString | null;
			generics?: Generic[] | null;
		},
	) {
		super();

		this.doc = extra?.doc ?? null;
		this.generics = extra?.generics ?? [];
	}

	// TODO: Implement rest params, conditional return types
	static parser: Parser<MethodSignature | ConstructSignature> = lazy(() =>
		PropertyWrap(
			seq([
				choice([str("new") as Parser<"new">, Identifier.parser]),
				optionalWhitespace,
				possibly(bracketed(sepByN(char(","), 1)(surroundWhitespace(Generic.parser)), "<")),
				optionalWhitespace,
				bracketed(sepByN(char(","), 0)(surroundWhitespace(Parameter.parser)), "("),
				possibly(seq([surroundWhitespace(str(":")), Type]).map(([_, type]) => type)),
			]),
		).map(([doc, [name, _1, generics, _2, parameters, returnType]]) => {
			if (name === "new") return new ConstructSignature(parameters, returnType ?? null, { doc, generics });
			else return new MethodSignature(name, parameters, returnType ?? null, { doc, generics });
		}),
	);

	toString() {
		return stringifyMethodLike(this.name.toString(), this);
	}
}

export class ConstructSignature extends ParserBase {
	kind: SyntaxKind.ConstructSignature = SyntaxKind.ConstructSignature;

	doc: DocString | null;
	generics: Generic[];

	constructor(
		public parameters: Parameter[],
		public returnType: Type | null,
		extra?: {
			doc?: DocString | null;
			generics?: Generic[] | null;
		},
	) {
		super();

		this.doc = extra?.doc ?? null;
		this.generics = extra?.generics ?? [];
	}

	static parser: Parser<MethodSignature | ConstructSignature> = MethodSignature.parser;

	toString() {
		return stringifyMethodLike("new", this);
	}
}

// ConstructSignature is not necessary here because MethodSignature already handles that case
export const ObjectChild = surroundWhitespace(
	choice([PropertySignature.parser, MethodSignature.parser, Comment.parser]),
);

export class ObjectType extends ParserBase {
	kind: SyntaxKind.ObjectType = SyntaxKind.ObjectType;

	doc: DocString | null;

	constructor(
		public members: (MethodSignature | ConstructSignature | PropertySignature | Comment)[],
		extra?: { doc?: DocString },
	) {
		super();
		this.doc = extra?.doc ?? null;
	}

	static parser: Parser<ObjectType> = lazy(() =>
		choice([bracketed(many(ObjectChild), "{").map(members => new ObjectType(members ?? []))]),
	);

	toString() {
		let out = "{\n";
		out += this.members.map(member => "\t" + member.toString()).join("\n");
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

// TODO - Implement named tuple members and rest
export class TupleType extends ParserBase {
	kind: SyntaxKind.TupleType = SyntaxKind.TupleType;

	constructor(public values: Type[]) {
		super();
	}

	static parser: Parser<TupleType> = lazy(() =>
		bracketed(sepByN(char(","), 0)(surroundWhitespace(Type)), "[").map(values => new TupleType(values)),
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
