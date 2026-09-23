import { markdownToHtml } from "./block-markdown";
import { applyInlineMarkdown, convertMarkdownLinks } from "./inline-markdown";
import { type PostProcessOptions, postProcess } from "./post-process";
import {
	autoLinkBareUrls,
	decodeEntities,
	mergeOrphanedBullets,
	normalizeWhitespace,
	splitInlineBulletRuns,
} from "./pre-process";
import { normalizeHtml } from "./sanitize";

function containsHtmlTags(text: string): boolean {
	const stripped = text.replace(/\[[^\]]+\]\([^)]+\)/g, "").replace(/\[https?:\/\/[^\]]+\]/g, "");
	return /<[^>]+>/.test(stripped);
}

export function parseRichText(text?: string | null, options?: PostProcessOptions): string {
	if (!text?.trim()) return "";

	const clean = normalizeWhitespace(text);

	if (containsHtmlTags(clean)) {
		const sanitized = normalizeHtml(clean);
		return postProcess(autoLinkBareUrls(applyInlineMarkdown(convertMarkdownLinks(sanitized))), options);
	}

	const decoded = normalizeHtml(splitInlineBulletRuns(mergeOrphanedBullets(decodeEntities(clean))));
	return postProcess(markdownToHtml(autoLinkBareUrls(convertMarkdownLinks(decoded))), options);
}
