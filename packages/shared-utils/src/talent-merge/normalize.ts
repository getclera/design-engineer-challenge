const COMPANY_SUFFIXES = /\b(inc\.?|ltd\.?|llc|gmbh|ag|s\.?a\.?|co\.?|corp\.?|plc|pty|pvt|limited|incorporated)\b/gi;
const DOMAIN_TLDS = /\.(com|ai|io|co|net|org)\b/g;

function foldPunctuation(name: string): string {
	return name
		.replace(/[‐-―−]/g, "-")
		.replace(/[‘’ʼ]/g, "'")
		.replace(/ /g, " ");
}

export function normalizeCompanyName(name: string): string {
	const withoutParens = foldPunctuation(name)
		.replace(/\s*\([^)]*\)/g, "")
		.trim();
	const base = withoutParens.length > 0 ? withoutParens : foldPunctuation(name);
	return base
		.toLowerCase()
		.replace(DOMAIN_TLDS, "")
		.replace(COMPANY_SUFFIXES, "")
		.replace(/[.,]/g, "")
		.replace(/^the\s+/, "")
		.replace(/\b(of|the|and|for|at)\b/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export function normalizeSchoolName(name: string): string {
	return foldPunctuation(name)
		.toLowerCase()
		.trim()
		.replace(/\([^)]*\)/g, "")
		.replace(/[,\-–—՞:;]/g, " ")
		.replace(/^the\s+/, "")
		.replace(/\b(of|the|and|for|at)\b/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export function parseFlexDate(dateStr: string | null | undefined): Date | null {
	if (!dateStr) return null;
	const trimmed = dateStr.trim();
	if (!trimmed) return null;

	const isoDate = new Date(trimmed);
	if (!Number.isNaN(isoDate.getTime())) return isoDate;

	const yearMonth = trimmed.match(/^(\d{4})(?:-(\d{1,2}))?$/);
	if (yearMonth) {
		const year = Number.parseInt(yearMonth[1], 10);
		const month = yearMonth[2] ? Number.parseInt(yearMonth[2], 10) - 1 : 0;
		return new Date(year, month, 1);
	}

	const slashFormat = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
	if (slashFormat) {
		return new Date(Number.parseInt(slashFormat[2], 10), Number.parseInt(slashFormat[1], 10) - 1, 1);
	}

	return null;
}

export function lookupTags(name: string, tagMap: Map<string, string[]>, normalizeFn: (n: string) => string): string[] {
	const normalized = normalizeFn(name);
	if (!normalized) return [];
	for (const [key, tags] of tagMap) {
		if (normalized.includes(key) || key.includes(normalized)) return tags;
	}
	return [];
}

type LinkedInDescriptionComponent = { text?: unknown };

function collectComponentText(components: unknown[]): string {
	return components
		.map((component) => (component as LinkedInDescriptionComponent | null)?.text)
		.filter((text): text is string => typeof text === "string" && text.length > 0)
		.join("\n");
}

export function parseLinkedInDescription(raw: string | null | undefined): string | null {
	if (!raw || typeof raw !== "string") return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;

	if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return trimmed;

	try {
		const parsed: unknown = JSON.parse(trimmed);
		if (typeof parsed !== "object" || parsed === null) return trimmed;
		const components = Array.isArray(parsed)
			? parsed
			: Object.keys(parsed)
					.sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
					.map((key) => (parsed as Record<string, unknown>)[key]);
		return collectComponentText(components).trim() || trimmed;
	} catch {
		return trimmed;
	}
}

export function sortByRecency(
	a: { isCurrent?: boolean | null; startDate?: string | null; endDate?: string | null },
	b: { isCurrent?: boolean | null; startDate?: string | null; endDate?: string | null },
): number {
	if (a.isCurrent && !b.isCurrent) return -1;
	if (!a.isCurrent && b.isCurrent) return 1;

	const endA = parseFlexDate(a.endDate)?.getTime() ?? Number.POSITIVE_INFINITY;
	const endB = parseFlexDate(b.endDate)?.getTime() ?? Number.POSITIVE_INFINITY;
	if (endA !== endB) return endB - endA;

	const startA = parseFlexDate(a.startDate)?.getTime() ?? 0;
	const startB = parseFlexDate(b.startDate)?.getTime() ?? 0;
	return startB - startA;
}
