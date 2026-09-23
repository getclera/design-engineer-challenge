import { ALL_COUNTRIES } from "@clera/shared-utils";

const COUNTRY_SUFFIXES = [...ALL_COUNTRIES, "United States of America", "USA", "UK", "UAE"].sort(
	(a, b) => b.length - a.length,
);

export function stripTrailingCountry(location: string): string {
	const lower = location.toLowerCase();
	for (const country of COUNTRY_SUFFIXES) {
		const c = country.toLowerCase();
		if (!lower.endsWith(c)) continue;
		const boundary = location[location.length - country.length - 1];
		if (boundary !== undefined && boundary !== " " && boundary !== ",") continue;
		const rest = location.slice(0, location.length - country.length).replace(/[\s,]+$/, "");
		return rest || location;
	}
	return location;
}
