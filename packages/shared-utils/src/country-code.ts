// biome-ignore format: keep the code list compact
const ISO2_CODES = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" ");

const REGION_CODES = new Set(ISO2_CODES);

const COUNTRY_NAME_ALIASES: Record<string, string> = {
	"united states of america": "US",
	turkey: "TR",
	uk: "GB",
	"hong kong": "HK",
	"bosnia and herzegovina": "BA",
};

const COUNTRY_NAME_TO_CODE: Map<string, string> = (() => {
	const display = new Intl.DisplayNames(["en"], { type: "region" });
	const map = new Map<string, string>();
	for (const code of ISO2_CODES) {
		let name: string | undefined;
		try {
			name = display.of(code);
		} catch {
			continue;
		}
		if (name && name !== code) map.set(name.toLowerCase(), code);
	}
	return map;
})();

const COUNTRY_NAME_LOOKUP: Map<string, string> = (() => {
	const map = new Map(COUNTRY_NAME_TO_CODE);
	for (const [name, code] of Object.entries(COUNTRY_NAME_ALIASES)) {
		if (!map.has(name)) map.set(name, code);
	}
	return map;
})();

export type CountryOption = { value: string; label: string };

export const COUNTRY_OPTIONS: readonly CountryOption[] = [...COUNTRY_NAME_TO_CODE.entries()]
	.map(([, code]) => ({ value: code, label: new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code }))
	.sort((a, b) => a.label.localeCompare(b.label));

export function resolveCountryCode(input: string | null | undefined): string | null {
	if (!input) return null;
	const trimmed = input.trim();
	if (!trimmed) return null;
	if (/^[A-Za-z]{2}$/.test(trimmed) && REGION_CODES.has(trimmed.toUpperCase())) {
		return trimmed.toUpperCase();
	}
	const direct = COUNTRY_NAME_LOOKUP.get(trimmed.toLowerCase());
	if (direct) return direct;
	const parts = trimmed
		.split(",")
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	for (let i = parts.length - 1; i >= 0; i--) {
		const code = COUNTRY_NAME_LOOKUP.get(parts[i]);
		if (code) return code;
	}
	const flat = trimmed.toLowerCase().replace(/\s+/g, " ");
	if (flat === "northern ireland" || flat.endsWith(" northern ireland")) return "GB";
	for (const [name, code] of COUNTRY_NAME_LOOKUP) {
		if (flat === name || flat.endsWith(` ${name}`)) return code;
	}
	return null;
}
