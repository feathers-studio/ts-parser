import * as Monaco from "monaco-editor";
import { parse } from "../index.ts";
import { ASTViewer } from "./astViewer.ts";

const value = `
/*
	Be advised:
	This parser is designed only for parsing d.ts files.
	This is not a full or production-ready TypeScript parser.
*/

/**
 * A sample interface
 */
interface A extends B, C, D {
	foo?: Bar;
	baz: string | number;
}`.trim();

const editorContainer = document.getElementsByTagName("main")[0]!;
const astViewer = document.getElementsByTagName("aside")[0]!;

const open = document.querySelector("button#open");
const close = document.querySelector("button#close");

open?.addEventListener("click", () => astViewer.querySelectorAll("details").forEach(d => (d.open = true)));
close?.addEventListener("click", () => astViewer.querySelectorAll("details").forEach(d => (d.open = false)));

const editor = Monaco.editor.create(editorContainer, {
	value,
	language: "typescript",
	automaticLayout: true,
	renderWhitespace: "all",
	renderValidationDecorations: "on",
	minimap: { enabled: false },
});

const model = editor.getModel()!;
Monaco.editor.setModelLanguage(model, "typescript");

let showAll = true;

const update = () => {
	const value = editor.getValue();
	const res = parse(value);
	if (res.isError) return (astViewer.textContent = res.error);
	const start = ASTViewer(astViewer, res.result, showAll);
	start.removeAttribute("hidden");
};

update();

model.onDidChangeContent(update);
