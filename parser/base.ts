import { Parser } from "arcsecond";

export const enum SyntaxKind {
	Unknown,

	Comment,
	Directive,
	Pragma,
	DocString,

	Identifier,
	Parameter,
	Generic,

	DeclareKeyword,
	ExportKeyword,

	InterfaceDeclaration,
	VariableDeclaration,
	VariableStatement,

	LiteralNumber,
	LiteralBigInt,
	LiteralString,
	LiteralBoolean,
	LiteralNull,
	LiteralUndefined,
	LiteralSymbol,

	PredefinedAny,
	PredefinedVoid,
	PredefinedNever,

	ThisType,

	IndexSignature,
	PropertySignature,
	MethodSignature,
	ConstructSignature,
	TypeReference,
	QualifiedName,

	ObjectType,
	IntersectionType,
	UnionType,
	TupleType,
	ArrayType,

	DeclarationFile,
}

export abstract class ParserBase {
	kind: SyntaxKind = SyntaxKind.Unknown;

	static parser: Parser<unknown>;

	abstract toString(): string;
}
