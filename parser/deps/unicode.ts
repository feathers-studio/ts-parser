let text: { Encoder: typeof TextEncoder; Decoder: typeof TextDecoder };

if (typeof TextEncoder !== "undefined") {
	text = { Encoder: TextEncoder, Decoder: TextDecoder };
} else {
	try {
		const util = require("util");
		text = { Encoder: util.TextEncoder, Decoder: util.TextDecoder };
	} catch (ex) {
		throw new Error("Arcsecond requires TextEncoder and TextDecoder to be polyfilled.");
	}
}

export const encoder = new text.Encoder();
export const decoder = new text.Decoder();

export const getString = (index: number, length: number, dv: DataView) =>
	decoder.decode(new Uint8Array(dv.buffer, dv.byteOffset + index, length));

export const getNextCharWidth = (index: number, dataView: DataView) => {
	const byte = dataView.getUint8(index);
	if ((byte & 0x80) >> 7 === 0) return 1;
	else if ((byte & 0xe0) >> 5 === 0b110) return 2;
	else if ((byte & 0xf0) >> 4 === 0b1110) return 3;
	else if ((byte & 0xf0) >> 4 === 0b1111) return 4;
	return 1;
};

export const getCharacterLength = (str: string) => {
	let cp;
	let total = 0;
	let i = 0;
	while (i < str.length) {
		cp = str.codePointAt(i);
		while (cp) {
			cp = cp >> 8;
			i++;
		}
		total++;
	}
	return total;
};
