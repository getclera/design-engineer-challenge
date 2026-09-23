interface JobLocationLike {
	cities?: string[] | null;
	normalized_locations?: string[] | null;
}

export const US_STATE_ABBREV: Record<string, string> = {
	alabama: "al",
	alaska: "ak",
	arizona: "az",
	arkansas: "ar",
	california: "ca",
	colorado: "co",
	connecticut: "ct",
	delaware: "de",
	"district of columbia": "dc",
	florida: "fl",
	georgia: "ga",
	hawaii: "hi",
	idaho: "id",
	illinois: "il",
	indiana: "in",
	iowa: "ia",
	kansas: "ks",
	kentucky: "ky",
	louisiana: "la",
	maine: "me",
	maryland: "md",
	massachusetts: "ma",
	michigan: "mi",
	minnesota: "mn",
	mississippi: "ms",
	missouri: "mo",
	montana: "mt",
	nebraska: "ne",
	nevada: "nv",
	"new hampshire": "nh",
	"new jersey": "nj",
	"new mexico": "nm",
	"new york": "ny",
	"north carolina": "nc",
	"north dakota": "nd",
	ohio: "oh",
	oklahoma: "ok",
	oregon: "or",
	pennsylvania: "pa",
	"rhode island": "ri",
	"south carolina": "sc",
	"south dakota": "sd",
	tennessee: "tn",
	texas: "tx",
	utah: "ut",
	vermont: "vt",
	virginia: "va",
	washington: "wa",
	"west virginia": "wv",
	wisconsin: "wi",
	wyoming: "wy",
};

export function usStateAbbrev(region: string): string | null {
	return US_STATE_ABBREV[region.toLowerCase()]?.toUpperCase() ?? null;
}

const CITY_ABBREVIATIONS: Record<string, string> = {
	"san francisco": "SF",
	"san francisco bay area": "SF Bay",
	"bay area": "Bay Area",
	"new york": "NYC",
	"new york city": "NYC",
	nyc: "NYC",
	"los angeles": "LA",
	"san jose": "SJ",
	seattle: "SEA",
	vancouver: "VAN",
	toronto: "TOR",
	london: "LDN",
	berlin: "BER",
	boston: "BOS",
	austin: "ATX",
	chicago: "CHI",
};

function abbreviateCity(city: string): string {
	const normalized = city.toLowerCase();
	if (CITY_ABBREVIATIONS[normalized]) return CITY_ABBREVIATIONS[normalized];
	if (normalized.startsWith("san francisco")) return "SF";
	if (normalized.startsWith("new york")) return "NYC";
	return city;
}

export function stripLocationMetadata(location: string): string {
	const separatorIndex = location.indexOf("·");
	if (separatorIndex === -1) return location.trim();
	const stripped = location.slice(0, separatorIndex).trim();
	return stripped.length > 0 ? stripped : location.trim();
}

const COUNTRY_ALIASES: Record<string, string> = {
	"united states": "United States",
	"united states of america": "United States",
	usa: "United States",
	us: "United States",
	america: "United States",
	"united kingdom": "United Kingdom",
	uk: "United Kingdom",
	"great britain": "United Kingdom",
	england: "United Kingdom",
	scotland: "United Kingdom",
	wales: "United Kingdom",
	germany: "Germany",
	deutschland: "Germany",
	canada: "Canada",
	france: "France",
	spain: "Spain",
	españa: "Spain",
	italy: "Italy",
	netherlands: "Netherlands",
	australia: "Australia",
	india: "India",
	china: "China",
	japan: "Japan",
	brazil: "Brazil",
	brasil: "Brazil",
	mexico: "Mexico",
	méxico: "Mexico",
	colombia: "Colombia",
	"puerto rico": "Puerto Rico",
};

const REGION_PHRASES = ["latin america", "south america", "central america", "north america"];

export const US_STATE_NAMES = Object.keys(US_STATE_ABBREV).filter((state) => state !== "georgia");

function normalizeForTokenMatch(location: string): string {
	const collapsed = location
		.toLowerCase()
		.replace(/[.,·/()-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	return ` ${collapsed} `;
}

export function expectedCountryFromLocation(location: string): string | null {
	let normalized = normalizeForTokenMatch(location);
	for (const phrase of REGION_PHRASES) {
		normalized = normalized.replaceAll(` ${phrase} `, " ");
	}

	const found = new Set<string>();
	for (const [alias, country] of Object.entries(COUNTRY_ALIASES)) {
		if (normalized.includes(` ${alias} `)) found.add(country);
	}
	if (found.size === 1) return [...found][0];
	if (found.size > 1) return null;

	for (const state of US_STATE_NAMES) {
		if (normalized.includes(` ${state} `)) return "United States";
	}
	return null;
}

export function violatesExpectedCountry(
	expectedCountry: string | null,
	resultCountry: string | null | undefined,
): boolean {
	if (!expectedCountry || !resultCountry) return false;
	return resultCountry.trim().toLowerCase() !== expectedCountry.trim().toLowerCase();
}

export function getLocationPreview(job: JobLocationLike | null | undefined): string {
	if (!job) return "Remote";

	let cities: string[] | null = null;

	if (job.cities && job.cities.length > 0) {
		cities = job.cities;
	} else if (job.normalized_locations && job.normalized_locations.length > 0) {
		cities = job.normalized_locations.map((loc) => loc.split(",")[0]?.trim()).filter((loc): loc is string => !!loc);
	}

	if (!cities || cities.length === 0) return "Remote";

	const seen = new Set<string>();
	const compactCities: string[] = [];

	for (const rawCity of cities) {
		const trimmed = rawCity.trim();
		if (!trimmed) continue;
		const abbr = abbreviateCity(trimmed);
		if (!seen.has(abbr)) {
			seen.add(abbr);
			compactCities.push(abbr);
		}
	}

	return compactCities.length === 0 ? "Remote" : compactCities.join(", ");
}

export const BAY_AREA_PATTERN =
	/\b(bay area|silicon valley|san francisco|south san francisco|palo alto|east palo alto|mountain view|menlo park|sunnyvale|santa clara|san jose|oakland|berkeley|emeryville|alameda|redwood city|san mateo|foster city|belmont|burlingame|millbrae|daly city|cupertino|campbell|milpitas|fremont|hayward|san leandro|los altos|los gatos|saratoga|san bruno|walnut creek|pleasanton|livermore)\b/i;

export function isInBayArea(location: string | null | undefined): boolean {
	return location != null && BAY_AREA_PATTERN.test(location);
}
