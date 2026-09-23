import { COUNTRY_OPTIONS } from "./country-code.ts";
import { getCountriesForContinent } from "./geo-polygons.ts";
import { expectedCountryFromLocation, usStateAbbrev } from "./location-utils.ts";
import { getCountriesInRegion as getSharedRegionCountries } from "./region-country-lists.ts";

const GRANULAR_REGIONS = {
	Nordics: ["Sweden", "Norway", "Denmark", "Finland", "Iceland"],
	Benelux: ["Belgium", "Netherlands", "Luxembourg"],
	"Western Europe": ["France", "Germany", "United Kingdom", "Spain", "Italy", "Portugal", "Ireland"],
	"Eastern Europe": ["Poland", "Czechia", "Romania", "Hungary", "Ukraine", "Bulgaria", "Slovakia"],
	"Southeast Asia": ["Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam", "Philippines", "Myanmar"],
	"East Asia": ["Japan", "South Korea", "China", "Taiwan", "Hong Kong"],
	"South Asia": ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal"],
	APAC: [
		"Japan",
		"South Korea",
		"China",
		"India",
		"Australia",
		"Singapore",
		"New Zealand",
		"Indonesia",
		"Malaysia",
		"Thailand",
		"Vietnam",
		"Philippines",
		"Taiwan",
		"Hong Kong",
	],
	EU: [
		"Austria",
		"Belgium",
		"Bulgaria",
		"Croatia",
		"Cyprus",
		"Czechia",
		"Denmark",
		"Estonia",
		"Finland",
		"France",
		"Germany",
		"Greece",
		"Hungary",
		"Ireland",
		"Italy",
		"Latvia",
		"Lithuania",
		"Luxembourg",
		"Malta",
		"Netherlands",
		"Poland",
		"Portugal",
		"Romania",
		"Slovakia",
		"Slovenia",
		"Spain",
		"Sweden",
		"United Kingdom",
	],
	EMEA: [
		"Austria",
		"Belgium",
		"Denmark",
		"Finland",
		"France",
		"Germany",
		"Ireland",
		"Israel",
		"Italy",
		"Netherlands",
		"Norway",
		"Poland",
		"Portugal",
		"South Africa",
		"Spain",
		"Sweden",
		"Switzerland",
		"United Arab Emirates",
		"United Kingdom",
	],
	LATAM: ["Brazil", "Mexico", "Argentina", "Colombia", "Chile", "Peru", "Ecuador", "Venezuela"],
	"Middle East": ["United Arab Emirates", "Israel", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"],
	Africa: ["South Africa", "Nigeria", "Kenya", "Egypt", "Morocco", "Ghana", "Ethiopia"],
	Oceania: ["Australia", "New Zealand"],
} as const;

const COUNTRY_ALIASES: Record<string, string> = {
	USA: "United States",
	US: "United States",
	"United States of America": "United States",
	UK: "United Kingdom",
	Britain: "United Kingdom",
	"Great Britain": "United Kingdom",
	England: "United Kingdom",
	UAE: "United Arab Emirates",
	"The Netherlands": "Netherlands",
	Holland: "Netherlands",
	"South Korea": "South Korea",
	Korea: "South Korea",
	"Republic of Korea": "South Korea",
	PRC: "China",
	"People's Republic of China": "China",
	"Hong Kong SAR": "Hong Kong",
	"Hong Kong, China": "Hong Kong",
	"Czech Republic": "Czechia",
	Brasil: "Brazil",
	Türkiye: "Turkey",
};

const REGIONS: Record<string, readonly string[]> = {
	DACH: getSharedRegionCountries("dach"),
	"North America": getSharedRegionCountries("na"),
	...GRANULAR_REGIONS,
};

const EXPANDABLE_REGIONS: Record<string, readonly string[]> = {
	...REGIONS,
	Europe: getCountriesForContinent("EUROPE").map((country) => COUNTRY_ALIASES[country] ?? country),
};

function buildCountryToRegionsMap(): Record<string, string[]> {
	const map: Record<string, string[]> = {};
	for (const [region, countries] of Object.entries(REGIONS)) {
		for (const country of countries) {
			if (!map[country]) {
				map[country] = [];
			}
			map[country].push(region);
		}
	}
	return map;
}

const COUNTRY_TO_REGIONS = buildCountryToRegionsMap();

export function getAllRegionNames(): string[] {
	return Object.keys(REGIONS);
}

export const ALL_COUNTRIES = [...new Set(Object.values(REGIONS).flat())].sort();

const KNOWN_COUNTRIES = [
	...new Set([
		...COUNTRY_OPTIONS.map((country) => country.label),
		...Object.values(EXPANDABLE_REGIONS).flat(),
		...Object.values(COUNTRY_ALIASES),
	]),
];
const KNOWN_COUNTRIES_SET = new Set(KNOWN_COUNTRIES);
const KNOWN_COUNTRIES_BY_LOWERCASE = new Map(KNOWN_COUNTRIES.map((country) => [country.toLowerCase(), country]));
const COUNTRY_ALIASES_BY_LOWERCASE = new Map(
	Object.entries(COUNTRY_ALIASES).map(([alias, country]) => [alias.toLowerCase(), country]),
);

function normalizeCountryName(country: string): string {
	if (!country) return "";
	const trimmed = country.trim();
	return (
		COUNTRY_ALIASES_BY_LOWERCASE.get(trimmed.toLowerCase()) ??
		KNOWN_COUNTRIES_BY_LOWERCASE.get(trimmed.toLowerCase()) ??
		trimmed
	);
}

export function getRegionsForCountry(country: string): string[] {
	const normalized = normalizeCountryName(country);
	return COUNTRY_TO_REGIONS[normalized] || [];
}

export type CountryRegionBucket = "us" | "europe" | "other";

const EUROPE_REGION_LABELS = new Set([
	"EU",
	"DACH",
	"Nordics",
	"Benelux",
	"Western Europe",
	"Eastern Europe",
	"Southern Europe",
]);

export function classifyCountryRegion(country: string | null | undefined): CountryRegionBucket {
	if (!country) return "other";
	const regions = getRegionsForCountry(country);
	if (regions.includes("North America")) return "us";
	if (regions.some((region) => EUROPE_REGION_LABELS.has(region))) return "europe";
	return "other";
}

export function classifyCountriesRegion(countries: readonly string[]): CountryRegionBucket | null {
	if (countries.length === 0) return null;
	for (const country of countries) {
		const bucket = classifyCountryRegion(country);
		if (bucket !== "other") return bucket;
	}
	return "other";
}

export function expandRegionToCountries(country: string): string[] {
	const trimmed = country.trim();
	const upper = trimmed.toUpperCase();
	for (const [key, countries] of Object.entries(EXPANDABLE_REGIONS)) {
		if (key.toUpperCase() === upper) {
			return [...countries];
		}
	}
	const normalized = normalizeCountryName(trimmed);
	if (KNOWN_COUNTRIES_SET.has(normalized)) {
		return [normalized];
	}
	return [trimmed];
}

export function resolveCountryLevelValue(value: string): { countries: string[]; isRegion: boolean } | null {
	const expanded = expandRegionToCountries(value);
	if (expanded.length > 1) return { countries: expanded, isRegion: true };
	if (expanded.length === 1 && KNOWN_COUNTRIES_SET.has(expanded[0])) {
		return { countries: expanded, isRegion: false };
	}
	return null;
}

function tryResolveCountry(candidate: string): string | null {
	if (!candidate) return null;
	const trimmed = candidate.trim();
	if (!trimmed) return null;
	const normalized = normalizeCountryName(trimmed);
	if (KNOWN_COUNTRIES_SET.has(normalized)) return normalized;
	return null;
}

function extractTrailingCountry(text: string): string | null {
	const words = text.split(/\s+/).filter(Boolean);
	for (let take = Math.min(words.length, 3); take >= 1; take--) {
		const candidate = words.slice(words.length - take).join(" ");
		const resolved = tryResolveCountry(candidate);
		if (resolved) return resolved;
	}
	return null;
}

function resolveCountrySegment(segment: string): string | null {
	if (usStateAbbrev(segment)) return null;
	return tryResolveCountry(segment) ?? extractTrailingCountry(segment);
}

export function extractCountryFromLocation(location: string | null | undefined): string | null {
	if (!location) return null;

	const cleaned = location.replace(/\bundefined\b/gi, "").trim();
	if (!cleaned) return null;

	const parts = cleaned
		.split(",")
		.map((p) => p.trim())
		.filter(Boolean);

	if (parts.length >= 1) {
		const resolved = resolveCountrySegment(parts[parts.length - 1]);
		if (resolved) return resolved;
	}

	const fallback = expectedCountryFromLocation(cleaned);
	if (fallback && KNOWN_COUNTRIES_SET.has(fallback)) return fallback;

	return null;
}
