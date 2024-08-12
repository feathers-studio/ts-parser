import { Parser, fail } from "arcsecond";

export const enum SyntaxKind {
	Unknown,

	Comment,
	Directive,
	Pragma,
	DocString,

	Identifier,
	Parameter,
	RestParameter,
	Generic,
	TypeQuery,
	KeyQuery,
	IndexedAccessType,

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

	FunctionType,
	ObjectType,
	IntersectionType,
	UnionType,
	TupleType,
	ArrayType,

	DeclarationFile,
}

export abstract class ParserBase {
	kind: SyntaxKind = SyntaxKind.Unknown;

	static parser = fail("Unimplemented!");

	abstract toString(): string;
}
