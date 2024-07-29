import { ParserBase } from "../base.ts";
import { h, render } from "./hyper.ts";

const div = h("div");
const span = h("span");

const details = h("details");
const summary = h("summary");

export function ASTViewer(root: HTMLElement, ast: ParserBase, showAll = false) {
	const astNode = details({ class: "ast-viewer" });
	const astSummary = summary({ class: "ast-viewer__node__name" }, ast.constructor.name);
	const node = div({ class: "ast-viewer__node" });

	const entries = Object.entries(ast);

	for (let [key, prop] of entries) {
		if (key === "kind") continue;
		if (!showAll && prop == null) continue;
		if (prop instanceof ParserBase) {
			node.append(ASTViewer(root, prop));
		} else if (Array.isArray(prop)) {
			if (prop.length === 0) continue;

			const property = details({ class: "ast-viewer__node__property" });
			const propertyName = summary(
				{ class: "ast-viewer__node__property__name" },
				key + "[]:",
				span({ class: "ast-viewer__node__property__length" }, `(${prop.length})`),
			);

			for (let node of prop)
				if (!showAll && node == null) continue;
				else if (node instanceof ParserBase) property.append(ASTViewer(root, node));
				else property.append(div({ class: "ast-viewer__node__property__item" }, String(node)));

			property.append(propertyName);
			node.append(property);
		} else {
			const property = div({ class: "ast-viewer__node__property" });
			const propertyName = div({ class: "ast-viewer__node__property__name" }, key + ":");
			const propertyContent = div({ class: "ast-viewer__node__property__content" }, String(prop));
			property.append(propertyName, propertyContent);
			node.append(property);
		}
	}

	// node.append(astSummary, content);
	astNode.append(astSummary);
	astNode.append(node);
	render(root, () => astNode, null);
	return astNode;
}
