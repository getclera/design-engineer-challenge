export const SLACK_SECTION_CHAR_LIMIT = 3000;

export function sanitizeSlackMrkdwn(text: string): string {
	if (!text) return text;
	let out = text.replace(/\\n/g, "\n");
	out = out.replace(/\*\*(.+?)\*\*/g, "*$1*");
	out = out.replace(/__(.+?)__/g, "*$1*");
	out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "<$2|$1>");
	out = out.replace(/~~(.+?)~~/g, "~$1~");
	out = out.replace(/^#{1,6}\s+/gm, "");
	out = out.replace(/📍\s?/g, "");
	out = ensureBalancedBold(out);
	return out;
}

export function ensureBalancedBold(text: string): string {
	if (!text || text.includes("\n")) return text;
	const isHeadlineShape = text.startsWith("*") && (text.includes(" · ") || /<[^>]+\|[^>]+>/.test(text));
	if (!isHeadlineShape) return text;
	if (!text.endsWith("*")) return `${text}*`;
	return text;
}

const PLACEHOLDER_RE =
	/^(?:<UNKNOWN>|\(unknown\)|unknown|n[/.]?a|not\s+(?:specified|available|provided|disclosed)|—|-)$/i;

export function sanitizeLLMPlaceholders(text: string): string {
	if (!text) return text;
	let out = text;

	out = out.replace(/<UNKNOWN>/gi, "UNKNOWN");
	out = out.replace(/<https?:\/\/[^>\n]*UNKNOWN[^>\n]*>/gi, "");

	out = out.replace(/\*(\w[\w\s]*):?\*\s+([^·\n]+)/g, (_match, _label, value) => {
		if (PLACEHOLDER_RE.test(value.trim())) return "";
		return _match;
	});

	out = out.replace(/ · ( · )+/g, " · ");
	out = out.replace(/^\s*· /gm, "");
	out = out.replace(/ · $/gm, "");
	out = out.replace(/ · \*$/gm, "*");

	out = out.replace(/^[\s·]+$/gm, "");

	return out.replace(/\n{3,}/g, "\n\n").trim();
}

export function stripSlackMrkdwn(text: string): string {
	if (!text) return text;
	let out = text;
	out = out.replace(/<(https?:\/\/[^>|]+)>/g, "$1");
	out = out.replace(/<[^>|]+\|([^>]+)>/g, "$1");
	out = out.replace(/\*([^*\n]+)\*/g, "$1");
	out = out.replace(/\b_([^_\n]+)_\b/g, "$1");
	out = out.replace(/ · /g, " | ");
	out = out.replace(/^• /gm, "- ");
	return out;
}

export function chunkText(text: string, maxLen: number): string[] {
	if (text.length <= maxLen) return [text];

	const chunks: string[] = [];
	let remaining = text;

	while (remaining.length > 0) {
		if (remaining.length <= maxLen) {
			chunks.push(remaining);
			break;
		}

		const slice = remaining.slice(0, maxLen);
		let splitAt = slice.lastIndexOf("\n\n");
		if (splitAt < 0) splitAt = slice.lastIndexOf("\n");
		if (splitAt < 0) splitAt = slice.lastIndexOf(" ");
		if (splitAt <= 0) splitAt = maxLen;

		chunks.push(remaining.slice(0, splitAt).trimEnd());
		remaining = remaining.slice(splitAt).trimStart();
	}

	return chunks;
}
