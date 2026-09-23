export function normalizeHeadingText(text: string): string {
	return text
		.replace(/<[^>]+>/g, " ")
		.replace(/&[a-z]+;|&#\d+;/gi, " ")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[*_`~>#]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}
