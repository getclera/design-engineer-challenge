export function codePointToString(codePoint: number): string {
	const valid =
		Number.isInteger(codePoint) && codePoint > 0 && codePoint <= 0x10ffff && (codePoint < 0xd800 || codePoint > 0xdfff);
	return valid ? String.fromCodePoint(codePoint) : "\uFFFD";
}

export function decodeHtmlEntities(text: string): string {
	return text
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/&#160;/g, " ")
		.replace(/&#xa0;/gi, " ")
		.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => codePointToString(Number.parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, dec) => codePointToString(Number.parseInt(dec, 10)));
}
