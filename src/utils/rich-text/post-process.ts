import { normalizeHeadingText } from "@clera/shared-utils";

const HTML_BULLET = "[•◦▪–—]";
const ASCII_BULLET = "[-+]";
const BULLET_ITEM_BODY = "([^<]*(?:<(?!/p>)[^<]*)*)";

const OPEN_TAG = /^\s*<([a-z][a-z0-9]*)\b[^>]*>/i;
const TEXT_ONLY_ELEMENT = /^\s*<([a-z][a-z0-9]*)\b[^>]*>\s*([^<]*)<\/\1>/i;

export interface PostProcessOptions {
	dropLeadingHeading?: string;
}

interface BulletRunOptions {
	separated?: boolean;
	min?: number;
}

function convertBulletRuns(html: string, marker: string, { separated = false, min = 1 }: BulletRunOptions = {}) {
	const head = separated ? `<p>\\s*${marker}\\s*</p>\\s*<p>` : `<p>\\s*${marker}\\s`;
	const runRe = new RegExp(`(?:${head}${BULLET_ITEM_BODY}</p>\\s*){${min},}`, "gi");
	const itemRe = new RegExp(`${head}(.*?)</p>`, "gis");

	return html.replace(runRe, (run) => {
		const items = [...run.matchAll(itemRe)];
		if (items.length === 0) return run;
		return `<ul>${items.map(([, item]) => `<li>${item.trim()}</li>`).join("")}</ul>`;
	});
}

interface OpenTagSpan {
	start: number;
	end: number;
	tag: string;
}

function dropEmptiedWrappers(html: string, openTags: OpenTagSpan[]): string {
	let result = html;
	for (let i = openTags.length - 1; i >= 0; i--) {
		const { start, end, tag } = openTags[i];
		const close = result.slice(end).match(new RegExp(`^\\s*</${tag}>`, "i"));
		if (!close) break;
		result = result.slice(0, start) + result.slice(end + close[0].length);
	}
	return result;
}

function stripLeadingHeading(html: string, heading: string): string {
	const target = normalizeHeadingText(heading);
	if (!target) return html;

	const openTags: OpenTagSpan[] = [];
	let offset = 0;

	for (let depth = 0; depth < 16; depth++) {
		const rest = html.slice(offset);

		const leaf = rest.match(TEXT_ONLY_ELEMENT);
		if (leaf) {
			const text = normalizeHeadingText(leaf[2]);
			if (!text) {
				offset += leaf[0].length;
				continue;
			}
			if (text !== target) return html;
			return dropEmptiedWrappers(html.slice(0, offset) + rest.slice(leaf[0].length), openTags);
		}

		const open = rest.match(OPEN_TAG);
		if (!open) return html;
		openTags.push({ start: offset, end: offset + open[0].length, tag: open[1] });
		offset += open[0].length;
	}

	return html;
}

export function postProcess(html: string, options?: PostProcessOptions): string {
	let result = html;

	result = result.replace(/<p>\s*<(strong|b)>([^<]+)<\/\1>\s*<\/p>/gi, "<h4>$2</h4>");

	result = result.replace(/<p>([A-Z][A-Z\s&/,\-–—:]{1,58})<\/p>/g, (match, text) => {
		const t = text.trim();
		if (/[a-z]/.test(t)) return match;
		return `<h4>${t.replace(/:\s*$/, "")}</h4>`;
	});

	result = convertBulletRuns(result, HTML_BULLET, { separated: true });
	result = convertBulletRuns(result, HTML_BULLET);
	result = convertBulletRuns(result, ASCII_BULLET, { min: 2 });

	result = result.replace(/<\/ul>\s*<ul>/gi, "");

	result = result.replace(/<p>\s*<\/p>/gi, "");
	result = result.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "");
	result = result.replace(/(<br\s*\/?>){3,}/gi, "<br><br>");

	if (options?.dropLeadingHeading) {
		result = stripLeadingHeading(result, options.dropLeadingHeading);
	}

	return result;
}
