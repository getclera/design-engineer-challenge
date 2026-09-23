export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";

	const units = ["B", "KB", "MB", "GB"];
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${(bytes / k ** i).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function capitalizeFirst(str: string | null | undefined): string {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
}

const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	CAD: "CA$",
	AUD: "A$",
	JPY: "¥",
	CNY: "¥",
	INR: "₹",
	BRL: "R$",
	SGD: "S$",
	HKD: "HK$",
	ILS: "₪",
	CHF: "CHF ",
	SEK: "SEK ",
	NOK: "NOK ",
	DKK: "DKK ",
	PLN: "PLN ",
	CZK: "CZK ",
};

export function getCurrencySymbol(currencyType?: string | null): string {
	if (!currencyType) return "$";
	const upper = currencyType.toUpperCase();
	return CURRENCY_SYMBOLS[upper] ?? `${upper} `;
}

export function humanizeKey(key: string): string {
	return key
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getCityShort(city?: string): string {
	if (!city || typeof city !== "string") return "";
	const cityLower = city.toLowerCase();
	if (/(new york( city)?|nyc|ny)/i.test(cityLower)) return "NYC";
	if (/(san francisco|sf|bay area)/i.test(cityLower)) return "SF";
	return city;
}

export const SALARY_SENTINEL_VALUE = 2_000_000_000;

export const YOE_UNKNOWN_SENTINEL = 999;

export function normalizeYoe(years: number | string | null | undefined): number | null {
	if (years == null || years === "") return null;
	const parsed = typeof years === "number" ? years : Number(years);
	if (!Number.isFinite(parsed) || parsed <= 0 || parsed === YOE_UNKNOWN_SENTINEL) return null;
	return parsed;
}

export function formatYoeCompact(years: number | null): string | null {
	const normalized = normalizeYoe(years);
	if (normalized == null) return null;
	return `${normalized}YOE`;
}

const EDUCATION_ABBREVIATIONS: Array<readonly [RegExp, string]> = [
	[/\bComputer Science and Engineering\b/gi, "CSE"],
	[/\bComputer Science\b/gi, "CS"],
	[/\bComputer Engineering\b/gi, "CE"],
	[/\bElectrical and Computer Engineering\b/gi, "ECE"],
	[/\bElectrical Engineering\b/gi, "EE"],
	[/\bMechanical Engineering\b/gi, "ME"],
	[/\bInformation Technology\b/gi, "IT"],
	[/\bData Science\b/gi, "DS"],
	[/\bMachine Learning\b/gi, "ML"],
	[/\bArtificial Intelligence\b/gi, "AI"],
	[/\bMassachusetts Institute of Technology\b/gi, "MIT"],
	[/\bCalifornia Institute of Technology\b/gi, "Caltech"],
	[/\bCarnegie Mellon University\b/gi, "CMU"],
	[/\bNew York University\b/gi, "NYU"],
	[/\bUniversity of California\b/gi, "UC"],
	[/\bStanford University\b/gi, "Stanford"],
	[/\bInstitute of Technology\b/gi, "Tech"],
	[/\bUniversity\b/gi, "Univ."],
];

export function abbreviateEducation(text: string): string {
	let out = text;
	for (const [pattern, replacement] of EDUCATION_ABBREVIATIONS) out = out.replace(pattern, replacement);
	return out;
}

const COMPANY_SUFFIX =
	/[\s,]+(?:Inc|Incorporated|Corp|Corporation|Co|Company|Ltd|Limited|Pvt|Private|Pte|Pty|GmbH|AG|PLC|LLP|LP|L\.?L\.?C|B\.?V|N\.?V|S\.?A\.?S|S\.?A|S\.?E|S\.?r\.?l)\.?$/i;

const GARBAGE_COMPANY_NAME =
	/^(full|part)[-\s]?time\b|^(contract|internship|freelance|self[-\s]?employed|undefined|unknown)\b|\b\d+\s*(yrs?|mos?)\b/i;

export function cleanCompanyName(name: string): string {
	let out = name.trim();
	for (let i = 0; i < 3; i++) {
		const next = out.replace(COMPANY_SUFFIX, "").trim();
		if (next === out) break;
		out = next;
	}
	const result = out || name.trim();
	if (GARBAGE_COMPANY_NAME.test(result)) return "";
	return result;
}

export function formatSalaryAmount(n: number, symbol: string): string {
	if (n >= 1_000_000) return `${symbol}${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
	if (n >= 1_000) return `${symbol}${(n / 1_000).toFixed(0)}k`;
	return `${symbol}${n}`;
}

export function formatCompactUsd(amount: number): string {
	if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
	if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
	if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
	return `$${amount}`;
}

export function formatSalaryRange(
	lowerBound?: number | null,
	upperBound?: number | null,
	currency?: string | null,
): string | null {
	const lo = lowerBound && lowerBound < SALARY_SENTINEL_VALUE ? lowerBound : undefined;
	const hi = upperBound && upperBound < SALARY_SENTINEL_VALUE ? upperBound : undefined;
	if (!lo && !hi) return null;

	const symbol = getCurrencySymbol(currency);

	if (lo && hi) return `${formatSalaryAmount(lo, symbol)} - ${formatSalaryAmount(hi, symbol)}`;
	if (lo) return `${formatSalaryAmount(lo, symbol)}+`;
	if (hi) return `Up to ${formatSalaryAmount(hi, symbol)}`;
	return null;
}

const EN_US_NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export function formatNumber(value: number | string): string {
	if (typeof value === "string") return value;
	if (!Number.isFinite(value)) return String(value);
	return EN_US_NUMBER_FORMAT.format(value);
}

export function renderTemplateSlots(template: string, slots: Record<string, string>): string {
	return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, name: string) => {
		const value = slots[name];
		if (value === undefined) throw new Error(`Template slot "${name}" was not provided`);
		return value;
	});
}
