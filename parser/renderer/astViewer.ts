import { ParserBase } from "../base.ts";
import { h, render } from "./hyper.ts";

const div = h("div");
const span = h("span");

const details = h("details");
const summary = h("summary");

const isObj = (val: unknown): val is Record<string, unknown> => typeof val === "object" && val !== null;

export function ASTViewer(root: HTMLElement, ast: ParserBase, { prop }: { prop?: string } = {}) {
	const astNode = details({ class: "ast-viewer" });
	const astSummary = summary(
		{ class: "ast-viewer__node__name" },
		prop && span({ class: "ast-viewer__node_meta" }, prop + ": "),
		ast.constructor.name,
	);
	const node = div({ class: "ast-viewer__node" });

	const entries = [...Object.entries(ast)];

	// move primitives to the top
	const sortedEntries = entries.sort(([, a], [, b]) => {
		if (isObj(a) && !isObj(b)) return 1;
		if (!isObj(a) && isObj(b)) return -1;
		return 0;
	});

	for (let [key, prop] of sortedEntries) {
		if (key === "kind") continue;
		if (prop instanceof ParserBase) {
			node.append(ASTViewer(root, prop, { prop: key }));
		} else if (Array.isArray(prop)) {
			if (prop.length === 0) continue;

			const property = details({ class: "ast-viewer__node__property" });
			const propertyName = summary(
				{ class: "ast-viewer__node__property__name" },
				key + "[]:",
				span({ class: "ast-viewer__node__property__length" }, `(${prop.length})`),
			);

			// move primitives to the top
			const sortedProps = prop.sort((a, b) => {
				if (isObj(a) && !isObj(b)) return 1;
				if (!isObj(a) && isObj(b)) return -1;
				return 0;
			});

			for (let i = 0; i < sortedProps.length; i++) {
				const node = sortedProps[i];
				if (node instanceof ParserBase) property.append(ASTViewer(root, node, { prop: String(i) }));
				else property.append(div({ class: "ast-viewer__node__property__item" }, String(node)));
			}

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
