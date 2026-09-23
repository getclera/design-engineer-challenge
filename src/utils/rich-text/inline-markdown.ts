import { escapeAttr, escapeHtml, normalizeUrl } from "./sanitize";

const TOKEN_PREFIX = "@@CLERAV2TOKEN";

export function convertMarkdownLinks(text: string): string {
	let result = text;
	result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
		const href = escapeAttr(normalizeUrl(url));
		return `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
	});
	result = result.replace(/\[https?:\/\/[^\]]+\]/g, (match) => {
		const raw = match.slice(1, -1);
		const href = escapeAttr(normalizeUrl(raw));
		return `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(raw)}</a>`;
	});
	return result;
}

export function applyInlineMarkdown(text: string): string {
	const anchors: string[] = [];
	const codes: string[] = [];

	let html = text.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (a) => {
		const t = `${TOKEN_PREFIX}A${anchors.length}@@`;
		anchors.push(a);
		return t;
	});
	html = html.replace(/`([^`\n]+)`/g, (_, code) => {
		const t = `${TOKEN_PREFIX}C${codes.length}@@`;
		codes.push(`<code>${escapeHtml(code)}</code>`);
		return t;
	});

	html = html.replace(/\*\*([^\n]+?)\*\*/g, "<strong>$1</strong>");
	html = html.replace(/__([^\n]+?)__/g, "<strong>$1</strong>");
	html = html.replace(/~~([^\n]+?)~~/g, "<del>$1</del>");
	html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
	html = html.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");

	html = html.replace(new RegExp(`${TOKEN_PREFIX}C(\\d+)@@`, "g"), (_, i) => codes[Number(i)] ?? "");
	return html.replace(new RegExp(`${TOKEN_PREFIX}A(\\d+)@@`, "g"), (_, i) => anchors[Number(i)] ?? "");
}
