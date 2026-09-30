import { formatCalendarYear, formatMonthYear } from "@clera/shared-utils";

// `ongoing` false: a job that ended on an unknown date. Say nothing rather than "Present".
function durationLabel(start: string | null, end: string | null, ongoing = true): string | null {
	if (!start || (!end && !ongoing)) return null;
	const s = new Date(start).getTime();
	const e = end ? new Date(end).getTime() : Date.now();
	const months = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24 * 30.44)));
	if (months >= 12) {
		const y = Math.floor(months / 12);
		const m = months % 12;
		return m > 0 ? `${y}y ${m}m` : `${y}y`;
	}
	return `${months}m`;
}

function dateRangeLabel(
	start: string | null,
	end: string | null,
	format: "month-year" | "year",
	ongoing = true,
): string | null {
	const formatBound = format === "year" ? formatCalendarYear : formatMonthYear;
	const startLabel = formatBound(start);
	const endLabel = formatBound(end);
	if (!startLabel) return endLabel;
	if (!endLabel && !ongoing) return startLabel;
	return `${startLabel} — ${endLabel || "Present"}`;
}

export { dateRangeLabel, durationLabel };
