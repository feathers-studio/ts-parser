function isEventListener(key: string): key is `on:${keyof HTMLElementEventMap}` {
	return key.startsWith("on:");
}

type EventListeners<E extends HTMLElement> = {
	[key in `on:${keyof HTMLElementEventMap}`]?: key extends `on:${infer T}`
		? T extends keyof HTMLElementEventMap
			? (this: E, ev: HTMLElementEventMap[T]) => any
			: never
		: never;
};

/*
	Mini-Hyper `h` function
	Licensed under MIT License (c) Feathers Studio (Muthu Kumar)
*/
export const h = <T extends keyof HTMLElementTagNameMap>(tag: T) => {
	type El = HTMLElementTagNameMap[T];
	type Listeners = EventListeners<El>;

	return (
		attrs: Record<string, string> & Listeners = {},
		...children: (HTMLElement | string | null | undefined)[]
	) => {
		const el = document.createElement(tag) as El;

		if (attrs && (typeof attrs === "string" || attrs instanceof HTMLElement)) {
			children.unshift(attrs);
			attrs = {};
		}

		for (const attr in attrs) {
			const val = attrs[attr];
			if (val != null)
				if (isEventListener(attr)) el.addEventListener(attr.slice(3), val as any);
				else el.setAttribute(attr, val);
		}

		for (const child of children) if (child) el.append(child);
		return el;
	};
};

type ClassNamesO = Record<string, boolean | null | undefined>;

const objectToClasses = (obj: ClassNamesO) =>
	Object.entries(obj)
		.filter(([_, v]) => v)
		.map(([k, _]) => k)
		.join(" ");

export const cx = (...classes: (string | ClassNamesO)[]) =>
	classes
		.map(c => (c && typeof c === "object" ? objectToClasses(c) : c))
		.filter(Boolean)
		.join(" ");

type Component<D> = (data: D) => HTMLElement;

export const render = <D>(root: HTMLElement, Component: Component<D>, data: D) => {
	root.innerHTML = "";
	root.appendChild(Component(data));
};
