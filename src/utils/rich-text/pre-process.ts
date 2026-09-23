import { codePointToString } from "@clera/shared-utils";
import { escapeAttr, normalizeUrl } from "./sanitize";

export function decodeEntities(text: string): string {
	return text
		.replace(/&#(\d+);/g, (_, n) => codePointToString(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => codePointToString(Number.parseInt(h, 16)))
		.replace(/&nbsp;/gi, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, "&");
}

export function normalizeWhitespace(text: string): string {
	return text
		.replace(/\r\n/g, "\n")
		.replace(/\r/g, "\n")
		.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
		.replace(/\u200C|\u200D|\uFEFF/g, "");
}

export function mergeOrphanedBullets(text: string): string {
	return text.replace(/^([ \t]*[-+*•◦▪–—])[ \t]*\n{1,3}(?=\S)/gm, "$1 ");
}

const INLINE_BULLET_MARKER = /[ \t]*[•◦▪][ \t]*/;
const MIN_INLINE_BULLET_ITEM_LENGTH = 25;

function splitBulletLine(line: string): string {
	const [leadIn, ...items] = line.split(INLINE_BULLET_MARKER);
	if (items.length < 2 || items.some((item) => item.length < MIN_INLINE_BULLET_ITEM_LENGTH)) return line;
	return [leadIn.trim(), ...items.map((item) => `• ${item}`)].filter(Boolean).join("\n");
}

export function splitInlineBulletRuns(text: string): string {
	return text.split("\n").map(splitBulletLine).join("\n");
}

export function autoLinkBareUrls(text: string): string {
	return text.replace(/(?<![("=])\b(https?:\/\/[^\s<>[\]"')\]]+)/g, (_, url) => {
		const href = escapeAttr(normalizeUrl(url));
		return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
	});
}
