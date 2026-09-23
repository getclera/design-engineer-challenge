export function truncateChars(text: string, maxChars: number): string {
	return text.slice(0, maxChars).replace(/[\uD800-\uDBFF]$/u, "");
}

export function truncateWholeWords(text: string | null | undefined, maxLen: number): string {
	if (!text) return "";
	const trimmed = text.trim();
	if (trimmed.length <= maxLen) return trimmed;
	const slice = trimmed.slice(0, maxLen);
	const lastSpace = slice.lastIndexOf(" ");
	const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
	return cut.replace(/[\s,;:–—-]+$/, "").trim();
}

const MIN_META_SENTENCE = 80;

const META_TRAILING_CONNECTIVE =
	/[\s,;:–—-]*\b(?:the|a|an|and|or|to|with|for|your|our|of|in|on|at|from|by|as|is|are|how|you|this|that|we|it|their|its|get|learn|discover|see|find|boost|improve|optimize|leverage|explore|master|unlock|streamline|drive|ensure|gain|reduce|avoid)\b[\s,;:–—-]*$/i;

export function cleanMetaDescription(raw: string | null | undefined, maxLen = 155): string {
	if (!raw) return "";
	let text = raw
		.trim()
		.replace(/^here(?:'s| is| are)\b[^:]*:\s*/i, "")
		.replace(/^(?:the\s+)?(?:optimized\s+)?(?:seo\s+)?meta\s+(?:description|elements|tags?)\s*[:-]?\s*/i, "")
		.replace(/^["'`]+|["'`]+$/g, "")
		.trim();

	if (text.length > maxLen) {
		const window = text.slice(0, maxLen);
		const sentence = window.match(/^.*[.!?]/s)?.[0]?.trim();
		text = sentence && sentence.length >= MIN_META_SENTENCE ? sentence : truncateWholeWords(text, maxLen);
	}

	if (/[.!?]$/.test(text)) return text;

	const priorSentence = text.match(/^.*[.!?]/s)?.[0]?.trim();
	if (priorSentence && priorSentence.length >= MIN_META_SENTENCE) return priorSentence;

	let prev = "";
	while (prev !== text) {
		prev = text;
		text = text.replace(META_TRAILING_CONNECTIVE, "").trim();
	}
	return text ? `${text.replace(/[\s,;:–—-]+$/, "")}.` : "";
}
