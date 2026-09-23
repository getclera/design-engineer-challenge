export const MS_PER_SECOND = 1_000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MS_PER_WEEK = 7 * MS_PER_DAY;

export function toDayKey(date: Date = new Date()): string {
	return date.toISOString().slice(0, 10);
}

function relativeTimeUnit(date: string | number): { value: number; unit: "now" | "m" | "h" | "d" } | null {
	const ms = typeof date === "number" ? Date.now() - date : Date.now() - new Date(date).getTime();
	if (Number.isNaN(ms)) return null;
	if (ms < MS_PER_MINUTE) return { value: 0, unit: "now" };
	const minutes = Math.round(ms / MS_PER_MINUTE);
	if (minutes < 60) return { value: minutes, unit: "m" };
	const hours = Math.round(ms / MS_PER_HOUR);
	if (hours < 24) return { value: hours, unit: "h" };
	return { value: Math.round(ms / MS_PER_DAY), unit: "d" };
}

type DateInput = string | number | Date | null | undefined;

interface FormatDateTimeOptions {
	fallback?: string;
	style?:
		| "datetime"
		| "date"
		| "short-date"
		| "short-datetime"
		| "time"
		| "weekday-long-datetime"
		| "weekday-short-datetime";
	locale?: string;
	timeZoneName?: "short" | "long";
	timeZone?: string;
}

const STYLE_OPTIONS: Record<NonNullable<FormatDateTimeOptions["style"]>, Intl.DateTimeFormatOptions> = {
	datetime: { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
	date: { year: "numeric", month: "short", day: "numeric" },
	"short-date": { month: "short", day: "numeric" },
	"short-datetime": { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
	time: { hour: "numeric", minute: "2-digit" },
	"weekday-long-datetime": { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" },
	"weekday-short-datetime": { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
};

export function formatDateTime(date: DateInput, options: FormatDateTimeOptions = {}): string {
	const { fallback = "—", style = "datetime", locale, timeZoneName, timeZone } = options;
	if (date === null || date === undefined || date === "") return fallback;
	const d = date instanceof Date ? date : new Date(date);
	if (Number.isNaN(d.getTime())) return fallback;
	const formatOptions: Intl.DateTimeFormatOptions = { ...STYLE_OPTIONS[style] };
	if (timeZoneName) formatOptions.timeZoneName = timeZoneName;
	if (timeZone) formatOptions.timeZone = timeZone;
	return d.toLocaleString(locale, formatOptions);
}

export function formatTimeAgo(dateString: string): string {
	const relative = relativeTimeUnit(dateString);
	if (!relative) return "";
	if (relative.unit === "now") return "just now";
	return `${relative.value}${relative.unit} ago`;
}

export function formatTimeAgoCompact(date: string | number): string {
	const relative = relativeTimeUnit(date);
	if (!relative) return "";
	if (relative.unit === "now") return "now";
	return `${relative.value}${relative.unit}`;
}

export function formatDurationMs(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
	const minutes = Math.floor(ms / 60_000);
	const seconds = Math.round((ms % 60_000) / 1000);
	return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

export function formatMonthsDuration(months: number): string | null {
	if (!Number.isFinite(months) || months <= 0) return null;
	const years = Math.floor(months / 12);
	const remaining = months % 12;
	if (years > 0 && remaining > 0) return `${years}y ${remaining}m`;
	if (years > 0) return `${years}y`;
	return `${remaining}m`;
}

export function formatRelativeGap(ms: number): string {
	if (!Number.isFinite(ms) || ms < MS_PER_MINUTE) return "";
	if (ms < MS_PER_HOUR) {
		const mins = Math.floor(ms / MS_PER_MINUTE);
		return `${mins} minute${mins === 1 ? "" : "s"}`;
	}
	if (ms < MS_PER_DAY) {
		const hours = Math.floor(ms / MS_PER_HOUR);
		return `${hours} hour${hours === 1 ? "" : "s"}`;
	}
	const days = Math.floor(ms / MS_PER_DAY);
	return `${days} day${days === 1 ? "" : "s"}`;
}

export function formatDurationHours(hours: number | null): string {
	if (hours === null || hours === undefined) return "N/A";
	if (hours < 1) return `${Math.round(hours * 60)}m`;
	if (hours < 24) return `${Math.round(hours)}h`;
	if (hours < 336) return `${(hours / 24).toFixed(1)}d`;
	return `${Math.round(hours / 168)}w`;
}

export function getXDaysAgo(days: number): Date {
	return new Date(Date.now() - days * MS_PER_DAY);
}

export function getMonday(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	d.setDate(d.getDate() + diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

export function isSameDay(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatTimerSeconds(seconds: number): string {
	const m = Math.floor(seconds / 60)
		.toString()
		.padStart(2, "0");
	const s = (seconds % 60).toString().padStart(2, "0");
	return `${m}:${s}`;
}

export function formatMinutesSeconds(seconds: number): string {
	return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export function formatDurationSeconds(seconds: number | null, fallback = "—"): string {
	if (seconds === null || seconds === undefined) return fallback;
	if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
	if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
	return `${(seconds / 86400).toFixed(1)}d`;
}

export function formatTodayLong(): string {
	return new Date().toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}

export function formatDateRange(start: Date, end: Date): string {
	const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
	const s = start.toLocaleDateString("en-US", opts);
	const e = end.toLocaleDateString("en-US", opts);
	return s.split(" ")[0] === e.split(" ")[0] ? `${s}–${end.getDate()}` : `${s} – ${e}`;
}

export function formatWeekdayDateRangeInTz(startIso: string, endIso: string, timezone: string): string {
	const opts: Intl.DateTimeFormatOptions = {
		weekday: "short",
		month: "short",
		day: "numeric",
		timeZone: timezone,
	};
	const start = new Date(startIso).toLocaleDateString("en-US", opts);
	const end = new Date(endIso).toLocaleDateString("en-US", opts);
	return `${start} → ${end}`;
}

export function getTimezoneShortLabel(timezone: string): string {
	const city = timezone.split("/").pop()?.replace(/_/g, " ") ?? timezone;
	return `${city} time`;
}

export function daysAgo(iso: string | null | undefined, now: number): number | null {
	if (!iso) return null;
	const parsed = Date.parse(iso);
	return Number.isNaN(parsed) ? null : Math.floor((now - parsed) / MS_PER_DAY);
}

export function isWithinDays(timestamp: string | null | undefined, days: number): boolean {
	if (!timestamp) return false;
	const ms = Date.parse(timestamp);
	if (Number.isNaN(ms)) return false;
	return Date.now() - ms <= days * MS_PER_DAY;
}

export function pgTimestampToUtcMs(value: string): number {
	const isoish = value.includes("T") ? value : value.replace(" ", "T");
	const normalized = /[+-]\d\d$/.test(isoish) ? `${isoish}:00` : isoish;
	const withZone = /[zZ]|[+-]\d\d:?\d\d$/.test(normalized) ? normalized : `${normalized}Z`;
	return new Date(withZone).getTime();
}

export function pgTimestampToUtcIso(value: string | null | undefined): string | null {
	if (!value) return null;
	const ms = pgTimestampToUtcMs(value);
	return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

export function formatInstantInTz(
	value: DateInput,
	timezone: string,
	options: Omit<FormatDateTimeOptions, "timeZone"> = {},
): string {
	if (value === null || value === undefined || value === "") return options.fallback ?? "—";
	const ms = typeof value === "string" ? pgTimestampToUtcMs(value) : value;
	return formatDateTime(ms, { ...options, timeZone: timezone });
}

export function wallClockDateInTz(value: string, timezone: string): Date {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			hour12: false,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
			.formatToParts(new Date(pgTimestampToUtcMs(value)))
			.map((p) => [p.type, p.value]),
	);
	return new Date(
		Number(parts.year),
		Number(parts.month) - 1,
		Number(parts.day),
		Number(parts.hour) % 24,
		Number(parts.minute),
		Number(parts.second),
	);
}

export function formatMonthYear(raw: string | null): string | null {
	if (!raw) return null;
	const trimmed = raw.trim();
	if (/^\d{4}$/.test(trimmed)) return trimmed;
	const date = new Date(trimmed);
	if (Number.isNaN(date.getTime())) return raw;
	const timeZone = /^\d{4}-\d{2}/.test(trimmed) ? "UTC" : undefined;
	return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone });
}

export function formatCalendarYear(raw: string | null): string | null {
	if (!raw) return null;
	const trimmed = raw.trim();
	if (/^\d{4}$/.test(trimmed)) return trimmed;
	const date = new Date(trimmed);
	if (Number.isNaN(date.getTime())) return null;
	return String(date.getUTCFullYear());
}
