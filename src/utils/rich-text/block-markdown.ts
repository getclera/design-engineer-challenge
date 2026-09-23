import { applyInlineMarkdown } from "./inline-markdown";

const BULLET_CHARS = "\\-+*•◦▪–—";
const UL_MARKER = new RegExp(`^\\s*[${BULLET_CHARS}]\\s*`);
const UL_MARKER_WITH_CONTENT = new RegExp(`^\\s*[${BULLET_CHARS}]\\s+\\S`);
const LONE_BULLET = new RegExp(`^[${BULLET_CHARS}]$`);

function renderListItems(lines: string[], strip: RegExp): string {
	return lines
		.map((l) => l.replace(strip, "").trim())
		.map((item) => `<li>${applyInlineMarkdown(item)}</li>`)
		.join("");
}

function detectHeading(line: string): string | null {
	const tl = line.trim();
	const boldMatch = tl.match(/^(?:\*\*(.+?)\*\*|__(.+?)__)$/);
	if (boldMatch) return boldMatch[1] ?? boldMatch[2];
	if (tl.length > 2 && tl.length < 60 && /^[A-Z][A-Z\s&/,\-–—:]+$/.test(tl) && !/[a-z]/.test(tl)) return tl;
	if (tl.length < 50 && /^[A-Z][^.!?]*:\s*$/.test(tl)) return tl.replace(/:\s*$/, "");
	const words = tl.split(/\s+/);
	if (
		words.length >= 2 &&
		words.length <= 6 &&
		tl.length < 50 &&
		!/[.!?;,]$/.test(tl) &&
		words.every((w) => /^[A-Z]/.test(w) || /^(a|an|and|at|by|for|in|of|on|or|the|to|with)$/i.test(w))
	) {
		return tl;
	}
	return null;
}

function normalizeLines(lines: string[]): string[] {
	const result: string[] = [];
	for (let i = 0; i < lines.length; i++) {
		const tl = lines[i].trim();

		if (LONE_BULLET.test(tl) && i + 1 < lines.length && lines[i + 1].trim()) {
			result.push(`${tl} ${lines[i + 1].trim()}`);
			i++;
			continue;
		}

		const heading = detectHeading(tl);
		if (heading) {
			result.push(`#### ${heading}`);
			continue;
		}

		result.push(lines[i]);
	}
	return result;
}

function convertBlock(block: string): string {
	const trimmed = block.trim();
	if (!trimmed) return "";

	const lines = normalizeLines(trimmed.split("\n"));
	const out: string[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		const tl = line.trim();

		if (!tl) {
			i++;
			continue;
		}

		const hm = tl.match(/^(#{1,6})\s+(.+)$/);
		if (hm) {
			const level = Math.max(2, hm[1].length);
			out.push(`<h${level}>${applyInlineMarkdown(hm[2].trim())}</h${level}>`);
			i++;
			continue;
		}

		if (/^\s*>\s?/.test(line)) {
			const ql: string[] = [];
			while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
				ql.push(lines[i].replace(/^\s*>\s?/, ""));
				i++;
			}
			out.push(`<blockquote>${applyInlineMarkdown(ql.join("\n")).replace(/\n/g, "<br>")}</blockquote>`);
			continue;
		}

		if (UL_MARKER_WITH_CONTENT.test(line)) {
			const ll: string[] = [];
			while (i < lines.length && UL_MARKER_WITH_CONTENT.test(lines[i])) {
				ll.push(lines[i]);
				i++;
			}
			out.push(`<ul>${renderListItems(ll, UL_MARKER)}</ul>`);
			continue;
		}

		if (/^\s*\d+[.)]\s+/.test(line)) {
			const ll: string[] = [];
			while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
				ll.push(lines[i]);
				i++;
			}
			out.push(`<ol>${renderListItems(ll, /^\s*\d+[.)]\s+/)}</ol>`);
			continue;
		}

		const pl: string[] = [];
		while (
			i < lines.length &&
			lines[i].trim() &&
			!/^(#{1,6})\s+/.test(lines[i].trim()) &&
			!/^\s*>\s?/.test(lines[i]) &&
			!UL_MARKER_WITH_CONTENT.test(lines[i]) &&
			!/^\s*\d+[.)]\s+/.test(lines[i])
		) {
			pl.push(lines[i]);
			i++;
		}
		out.push(`<p>${applyInlineMarkdown(pl.join("\n")).replace(/\n/g, "<br>")}</p>`);
	}

	return out.join("");
}

export function markdownToHtml(text: string): string {
	const normalized = text.trim();
	if (!normalized) return "";
	return normalized
		.split(/\n{2,}/)
		.map(convertBlock)
		.join("");
}
