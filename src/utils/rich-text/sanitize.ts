const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

export function escapeHtml(value: string): string {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttr(value: string): string {
	return escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function normalizeUrl(url: string): string {
	const trimmed = url.trim();
	if (!trimmed) return "#";
	if (/^[#/]|^\.\.?\//.test(trimmed)) return trimmed;
	const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\d+.-]*):/);
	if (!schemeMatch) return `https://${trimmed}`;
	return SAFE_SCHEMES.has(schemeMatch[1].toLowerCase()) ? trimmed : "#";
}

const ALLOWED_TAGS = new Set([
	"p",
	"br",
	"ul",
	"ol",
	"li",
	"strong",
	"em",
	"b",
	"i",
	"a",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"span",
	"div",
	"table",
	"tr",
	"td",
	"th",
	"thead",
	"tbody",
	"blockquote",
	"code",
	"pre",
	"hr",
	"dl",
	"dt",
	"dd",
	"sub",
	"sup",
	"u",
	"s",
	"del",
	"ins",
	"abbr",
	"mark",
	"section",
	"article",
	"header",
	"footer",
	"figure",
	"figcaption",
	"img",
]);

const ALLOWED_ATTRS = new Set([
	"href",
	"target",
	"rel",
	"class",
	"id",
	"colspan",
	"rowspan",
	"style",
	"src",
	"alt",
	"width",
	"height",
]);

function isDangerousStyleValue(value: string): boolean {
	return /url\s*\(|expression\s*\(|javascript:|@import|behavior\s*:/i.test(value);
}

function sanitizeStyle(style: string): string {
	const safe: string[] = [];
	for (const decl of style.split(";")) {
		const colonIdx = decl.indexOf(":");
		if (colonIdx === -1) continue;
		const prop = decl.slice(0, colonIdx).trim().toLowerCase();
		const value = decl.slice(colonIdx + 1).trim();
		if (!value || !prop) continue;
		if (isDangerousStyleValue(value)) continue;
		if (prop === "position" && /fixed|sticky/i.test(value)) continue;
		if (prop === "z-index" && Math.abs(Number.parseInt(value, 10)) > 10) continue;
		if (prop === "pointer-events") continue;
		safe.push(`${prop}:${value}`);
	}
	return safe.join(";");
}

export function sanitizeHtml(html: string): string {
	let safe = html;
	safe = safe.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
	safe = safe.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

	safe = safe.replace(/<[^>]*>/g, (tag) => tag.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, ""));

	return safe.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/gi, (match, tagName: string, rawAttrs: string) => {
		const parsedTag = tagName.toLowerCase();
		const tag = parsedTag === "h1" ? "h2" : parsedTag;

		if (!ALLOWED_TAGS.has(parsedTag)) return "";
		if (match.startsWith("</")) return `</${tag}>`;

		const isSelfClosing = match.endsWith("/>") || tag === "br" || tag === "hr" || tag === "img";

		const safeAttrs: string[] = [];
		const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
		let attrMatch: RegExpExecArray | null = null;

		// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
		while ((attrMatch = attrRegex.exec(rawAttrs ?? "")) !== null) {
			const attrName = attrMatch[1].toLowerCase();
			const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

			if (!ALLOWED_ATTRS.has(attrName)) continue;

			if (attrName === "href") {
				safeAttrs.push(`${attrName}="${escapeAttr(normalizeUrl(attrValue))}"`);
			} else if (attrName === "src") {
				const normalized = normalizeUrl(attrValue);
				if (normalized !== "#") safeAttrs.push(`${attrName}="${escapeAttr(normalized)}"`);
			} else if (attrName === "style") {
				const safeStyle = sanitizeStyle(attrValue);
				if (safeStyle) safeAttrs.push(`style="${escapeAttr(safeStyle)}"`);
			} else {
				safeAttrs.push(`${attrName}="${escapeAttr(attrValue)}"`);
			}
		}

		const attrStr = safeAttrs.length > 0 ? ` ${safeAttrs.join(" ")}` : "";
		return isSelfClosing ? `<${tag}${attrStr} />` : `<${tag}${attrStr}>`;
	});
}

export function normalizeHtml(html: string): string {
	return sanitizeHtml(html);
}
