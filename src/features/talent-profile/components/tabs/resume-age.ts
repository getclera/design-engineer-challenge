import { MS_PER_DAY } from "@clera/shared-utils";

const STALE_RESUME_DAYS = 183;
const DAYS_PER_MONTH = 30.44;

function formatResumeAge(days: number): string {
	const months = Math.floor(days / DAYS_PER_MONTH);
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;
	const yearLabel = years === 1 ? "1 year" : `${years} years`;
	const monthLabel = remainingMonths === 1 ? "1 month" : `${remainingMonths} months`;
	if (years === 0) return monthLabel;
	if (remainingMonths === 0) return yearLabel;
	return `${yearLabel} ${monthLabel}`;
}

function getStaleResumeLabel(uploadedAt: string | null | undefined): string | null {
	if (!uploadedAt) return null;
	const uploadedMs = new Date(uploadedAt).getTime();
	if (Number.isNaN(uploadedMs)) return null;
	const days = Math.floor((Date.now() - uploadedMs) / MS_PER_DAY);
	if (days < STALE_RESUME_DAYS) return null;
	return formatResumeAge(days);
}

export { getStaleResumeLabel };
