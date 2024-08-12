import * as Monaco from "monaco-editor";
// @ts-expect-error No TS declarations?
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// @ts-expect-error No TS declarations?
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
	getWorker(_: any, label: string) {
		if (label === "typescript" || label === "javascript") return new tsWorker();
		return new editorWorker();
	},
};

Monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

export { Monaco };
