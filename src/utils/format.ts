import { JOB_TYPES } from "@clera/shared-types/talent-preferences-constants";
import { WORKPLACE_TYPE } from "@clera/shared-types/workplace-type";
import {
	capitalizeFirst,
	cleanSentinelField,
	formatCompactUsd,
	formatFileSize,
	formatNumber,
	formatSalaryAmount,
	formatSalaryRange,
	formatYoeCompact,
	getCurrencySymbol,
	getInitials,
	humanizeKey,
	normalizeYoe,
	SALARY_SENTINEL_VALUE,
	usStateAbbrev,
	YOE_UNKNOWN_SENTINEL,
} from "@clera/shared-utils";
import { stripTrailingCountry } from "./strip-trailing-country";

export {
	capitalizeFirst,
	formatFileSize,
	formatNumber,
	formatYoeCompact,
	getInitials,
	humanizeKey,
	normalizeYoe,
	SALARY_SENTINEL_VALUE,
	YOE_UNKNOWN_SENTINEL,
};

export function maskEmail(email: string): string {
	const atIdx = email.indexOf("@");
	if (atIdx === -1) return "****";
	const local = email.slice(0, atIdx);
	const rest = email.slice(atIdx + 1);
	const dotIdx = rest.lastIndexOf(".");
	const domainName = dotIdx === -1 ? rest : rest.slice(0, dotIdx);
	const tld = dotIdx === -1 ? "" : rest.slice(dotIdx);

	const visible = local.slice(-2);

	const maskedDomain =
		domainName.length <= 2
			? "*".repeat(domainName.length)
			: `${domainName[0]}${"*".repeat(Math.max(1, domainName.length - 2))}${domainName[domainName.length - 1]}`;

	return `****${visible}@${maskedDomain}${tld}`;
}

export function toInvestorSlug(name: string): string {
	return name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

export function formatDisplayUrl(url: string): string {
	return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function formatRatioAsPercent(ratio: number, digits = 1): string {
	return `${(ratio * 100).toFixed(digits)}%`;
}

export function formatPercentValue(value: number, digits = 1): string {
	return `${(value ?? 0).toFixed(digits)}%`;
}

export function toPercentValue(rate: number): number {
	return Math.round(rate * 1000) / 10;
}

export function formatUnitOrDash(value: number | null, suffix: string): string {
	return value === null ? "—" : `${value}${suffix}`;
}

export function formatFundingStage(raw: string): string {
	return raw
		.toLowerCase()
		.replace(/_/g, " ")
		.replace(/(^|[\s-])(\w)/g, (_, sep, c) => sep + c.toUpperCase());
}

export function formatFundingUsd(amount: number | null | undefined): string | null {
	if (!amount || amount <= 0) return null;
	return formatCompactUsd(amount).replace(/\.0(?=[MB]$)/, "");
}

export function formatCurrency(raw: unknown): string {
	const val = Number(raw);
	if (!Number.isFinite(val) || val === 0) return "$0";
	if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
	if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
	return `$${val.toLocaleString()}`;
}

export const FUNDING_MAGNITUDES: Record<string, number> = {
	k: 1_000,
	m: 1_000_000,
	b: 1_000_000_000,
	t: 1_000_000_000_000,
};

function parseFundingNumber(raw: string): number | null {
	const match = raw.match(/(\d[\d\s.,]*)\s*([kmbt])?/i);
	if (!match) return null;
	const [, digits, magnitude] = match;
	const value = Number(
		digits
			.replace(/\s/g, "")
			.replace(/,(\d{1,2})$/, ".$1")
			.replace(/,/g, ""),
	);
	if (!Number.isFinite(value) || value <= 0) return null;
	return magnitude ? value * FUNDING_MAGNITUDES[magnitude.toLowerCase()] : value;
}

function parseFundingAmount(raw: string): number | null {
	try {
		const parsed = JSON.parse(raw);
		if (parsed?.amount) return parseFundingNumber(String(parsed.amount));
	} catch {
		return parseFundingNumber(raw);
	}
	return parseFundingNumber(raw);
}

export function formatFundingAmount(raw: string | number): string {
	const amount = typeof raw === "number" ? raw : parseFundingAmount(raw);
	if (amount === null || !Number.isFinite(amount)) return typeof raw === "string" && /\d/.test(raw) ? raw : "";
	return formatFundingUsd(amount) ?? `$${formatNumber(amount)}`;
}

export function formatLocation(loc: {
	normalizedLocation?: string | null;
	city?: string | null;
	state?: string | null;
	country?: string | null;
}): string {
	return loc.normalizedLocation || [loc.city, loc.state, loc.country].filter(Boolean).join(", ") || "Unknown";
}

export function formatExperienceRange(
	min: number | null | undefined,
	max: number | null | undefined,
	compact = false,
): string | null {
	const unit = compact ? "y" : " years";
	if (min == null && max == null) return null;
	if (min != null && max != null) return `${min}–${max}${unit}`;
	if (min != null) return `${min}+${unit}`;
	return `Up to ${max}${unit}`;
}

export function formatSalaryFloor(floor: number, currency: string): string {
	return `${formatSalaryAmount(floor, getCurrencySymbol(currency))}+`;
}

export function formatCompactSalary(lower?: number | null, upper?: number | null): string | null {
	if (!lower) return null;
	const lo = Math.floor(lower / 1000);
	if (upper) return `$${lo}-${Math.floor(upper / 1000)}k`;
	return `$${lo}k+`;
}

const EMPLOYMENT_LABELS: Record<string, string> = {
	FULL_TIME: "Full-time",
	PART_TIME: "Part-time",
	CONTRACTOR: "Contract",
	TEMPORARY: "Temporary",
	INTERN: "Internship",
	PER_DIEM: "Per diem",
	VOLUNTEER: "Volunteer",
	OTHER: "Other",
};

export function formatEmploymentType(raw: string): string {
	return EMPLOYMENT_LABELS[raw] ?? raw;
}

export function shortenLocation(location: string): string {
	return location.split(",")[0]?.trim() || location;
}

function stripMetroArea(location: string): string {
	const stripped = location
		.replace(/\s+metropolitan\s+area$/i, "")
		.replace(/\s+bay\s+area$/i, "")
		.replace(/\s+area$/i, "")
		.replace(/^greater\s+/i, "")
		.trim();
	return stripped || location;
}

function abbreviateStates(location: string): string {
	const parts = location
		.split(",")
		.map((p) => p.trim())
		.filter(Boolean);
	return parts.map((part) => usStateAbbrev(part) ?? part).join(", ");
}

export function compactLocation(raw: string | null | undefined, opts?: { abbreviateState?: boolean }): string | null {
	if (!raw) return null;
	const suffixMatch = raw.match(/\s*·\s*(Remote|On-site|On site|Hybrid)\s*$/i);
	const suffix = suffixMatch ? ` · ${suffixMatch[1]}` : "";
	const locationPart = suffixMatch ? raw.slice(0, suffixMatch.index) : raw;
	const cleaned = cleanLocationString(locationPart);
	if (!cleaned) return suffix.trim() || null;
	const noCountry = stripTrailingCountry(cleaned);
	const base = opts?.abbreviateState ? abbreviateStates(noCountry) : stripMetroArea(shortenLocation(noCountry));
	return `${base}${suffix}` || null;
}

export function cleanLocationString(raw: string | null | undefined): string | null {
	if (!raw) return null;
	const stripped = raw
		.replace(/\bundefined\b/gi, "")
		.replace(/\s+/g, " ")
		.trim();
	if (!stripped) return null;
	const parts = stripped.split(/\s*,\s*/).filter(Boolean);
	const deduped: string[] = [];
	for (const part of parts) {
		const trimmed = part.trim();
		if (!trimmed) continue;
		if (deduped[deduped.length - 1]?.toLowerCase() !== trimmed.toLowerCase()) {
			deduped.push(trimmed);
		}
	}
	return deduped.length === 0 ? null : deduped.join(", ");
}

export function cleanField(value: string | null | undefined): string | null {
	if (value == null) return null;
	return cleanSentinelField(value) === null ? null : value.trim();
}

export function collapseWhitespace(value: string | null | undefined): string | null {
	if (value == null) return null;
	const collapsed = value.replace(/\s+/g, " ").trim();
	return collapsed.length === 0 ? null : collapsed;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseMonth(ym: string): { month: string; year: string } {
	const parts = ym.split("-");
	const idx = Number.parseInt(parts[1] ?? "1", 10) - 1;
	return { month: MONTH_NAMES[idx] ?? ym, year: parts[0] ?? "" };
}

const MIN_DISPLAY_SALARY = 30_000;

export function formatDisplaySalary(
	lower: number | null,
	upper: number | null,
	currency: string | null,
): string | null {
	if (Math.max(lower ?? 0, upper ?? 0) < MIN_DISPLAY_SALARY) return null;
	return formatSalaryRange(lower, upper, currency);
}

export function formatYoeShort(years: number | null): string | null {
	const normalized = normalizeYoe(years);
	if (normalized === null || normalized < 1) return null;
	return `${normalized}+ yrs`;
}

export function formatAgentName(name: string | null | undefined): string {
	if (!name || typeof name !== "string") return "Agent";
	const cleaned = name.replace(/-agent$/i, "").replace(/[-_]/g, " ");
	return capitalizeFirst(cleaned) || "Agent";
}

const PREFERENCE_TAG_ABBREVIATIONS: Record<string, string> = {
	[JOB_TYPES.FULL_TIME]: "FT",
	[JOB_TYPES.PART_TIME]: "PT",
	[JOB_TYPES.INTERNSHIP]: "Int",
	[JOB_TYPES.CONTRACT]: "Ctr",
	[JOB_TYPES.FREELANCE]: "FL",
	[WORKPLACE_TYPE.REMOTE]: "R",
	[WORKPLACE_TYPE.HYBRID]: "H",
	[WORKPLACE_TYPE.ON_SITE]: "O",
	[WORKPLACE_TYPE.ON_SITE_OR_REMOTE]: "O/R",
};

export function abbreviatePreferenceTag(value: string): string {
	return PREFERENCE_TAG_ABBREVIATIONS[value] ?? value;
}

const NEXT_IMAGE_WIDTHS = [16, 32, 48, 64, 96, 128, 256] as const;

const SELF_OPTIMIZER_HOST_RE = /^https?:\/\/(?:www\.|app\.)?getclera\.com\//i;

export function optimizedImageUrl(src: string | null | undefined, renderedPx: number): string | null {
	if (!src) return null;
	if (
		!/^https?:\/\//i.test(src) ||
		/\.svg(\?|$)/i.test(src) ||
		/^https?:\/\/[a-z0-9-]+\.supabase\.co\/storage\//i.test(src) ||
		!SELF_OPTIMIZER_HOST_RE.test(src)
	)
		return src;
	const target = renderedPx * 2;
	const width = NEXT_IMAGE_WIDTHS.find((w) => w >= target) ?? NEXT_IMAGE_WIDTHS[NEXT_IMAGE_WIDTHS.length - 1];
	return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

export function formatSalaryDisplay(value: unknown): string {
	const digits = String(value ?? "").replace(/\D/g, "");
	if (!digits) return "";
	return `$${Number(digits).toLocaleString("en-US")}`;
}

export function parseSalaryInput(raw: string): number | "" {
	const lower = raw.toLowerCase();
	const cleaned = lower.replace(/[^\d.]/g, "");
	if (!cleaned) return "";
	const num = Number.parseFloat(cleaned);
	if (Number.isNaN(num)) return "";
	return Math.round(lower.includes("k") ? num * 1000 : num);
}
